import { supabase } from '@/integrations/supabase/client';
import { RecruitmentCandidate, BulkCandidateImport, EmailTemplate, EmailBatch } from '@/types/recruitment';
import { generateUUID } from '@/utils/uuid';

class RecruitmentService {
  // Candidate Management
  async getCandidates(): Promise<RecruitmentCandidate[]> {
    try {
      const { data, error } = await supabase
        .from('recruitment_candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, create it first
        if (error.message.includes('does not exist')) {
          console.log('Table does not exist, creating it...');
          await this.ensureTablesExist();
          // Retry after creating tables
          const { data: retryData, error: retryError } = await supabase
            .from('recruitment_candidates')
            .select('*')
            .order('created_at', { ascending: false });
          if (retryError) throw retryError;
          return retryData || [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  }

  private async ensureTablesExist(): Promise<void> {
    try {
      // Try to create the table using raw SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS recruitment_candidates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            position TEXT NOT NULL,
            experience TEXT,
            skills TEXT[],
            resume_url TEXT,
            status TEXT DEFAULT 'invited',
            match_score INTEGER,
            ai_analysis JSONB,
            screening_questions JSONB,
            interview_scheduled_at TIMESTAMPTZ,
            invited_by TEXT,
            invited_at TIMESTAMPTZ DEFAULT now(),
            applied_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS email_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'invitation',
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS email_batches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            template_id UUID REFERENCES email_templates(id),
            candidate_ids UUID[],
            sent_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_by TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            completed_at TIMESTAMPTZ
          );

          -- Enable RLS and add policies
          ALTER TABLE recruitment_candidates ENABLE ROW LEVEL SECURITY;
          ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
          ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;

          -- Allow public access for application submissions
          DROP POLICY IF EXISTS "Public can read recruitment_candidates" ON recruitment_candidates;
          CREATE POLICY "Public can read recruitment_candidates" ON recruitment_candidates FOR SELECT USING (true);
          
          DROP POLICY IF EXISTS "Public can update recruitment_candidates" ON recruitment_candidates;
          CREATE POLICY "Public can update recruitment_candidates" ON recruitment_candidates FOR UPDATE USING (true);

          -- Allow authenticated users to manage all data
          DROP POLICY IF EXISTS "Authenticated can manage recruitment_candidates" ON recruitment_candidates;
          CREATE POLICY "Authenticated can manage recruitment_candidates" ON recruitment_candidates FOR ALL USING (auth.role() = 'authenticated');

          DROP POLICY IF EXISTS "Authenticated can manage email_templates" ON email_templates;
          CREATE POLICY "Authenticated can manage email_templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');

          DROP POLICY IF EXISTS "Authenticated can manage email_batches" ON email_batches;
          CREATE POLICY "Authenticated can manage email_batches" ON email_batches FOR ALL USING (auth.role() = 'authenticated');

          -- Insert default template
          INSERT INTO email_templates (name, subject, body, type, is_default)
          SELECT 'Default Invitation', 'Job Application Invitation - {{position}}', 
            'Hi {{first_name}},

We found your profile interesting for our {{position}} role. Please complete your application using the link below:

{{application_link}}

Best regards,
HR Team', 'invitation', true
          WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Invitation');
        `
      });

      if (error) {
        console.error('Error creating tables with RPC:', error);
        throw error;
      }

      console.log('✅ Recruitment tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw new Error('Could not create database tables. Please contact administrator.');
    }
  }

  async getCandidateByToken(token: string): Promise<RecruitmentCandidate | null> {
    const { data, error } = await supabase
      .from('recruitment_candidates')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async createCandidate(candidate: Omit<RecruitmentCandidate, 'id' | 'token' | 'created_at' | 'updated_at'>): Promise<RecruitmentCandidate> {
    const candidateData = {
      ...candidate,
      token: generateUUID(),
      status: 'invited' as const,
      invited_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('recruitment_candidates')
      .insert([candidateData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCandidate(id: string, updates: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
    const { data, error } = await supabase
      .from('recruitment_candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCandidateByToken(token: string, updates: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
    const { data, error } = await supabase
      .from('recruitment_candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('token', token)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async bulkCreateCandidates(candidates: BulkCandidateImport[], invitedBy: string): Promise<RecruitmentCandidate[]> {
    const candidatesData = candidates.map(candidate => ({
      ...candidate,
      token: generateUUID(),
      status: 'invited' as const,
      invited_by: invitedBy,
      invited_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('recruitment_candidates')
      .insert(candidatesData)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Email Template Management
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Email Batch Management
  async createEmailBatch(batch: Omit<EmailBatch, 'id' | 'created_at'>): Promise<EmailBatch> {
    const { data, error } = await supabase
      .from('email_batches')
      .insert([batch])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailBatch(id: string, updates: Partial<EmailBatch>): Promise<EmailBatch> {
    const { data, error } = await supabase
      .from('email_batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEmailBatches(): Promise<EmailBatch[]> {
    const { data, error } = await supabase
      .from('email_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Dashboard Stats
  async getRecruitmentStats() {
    const { data: candidates, error: candidatesError } = await supabase
      .from('recruitment_candidates')
      .select('status, created_at, match_score');

    if (candidatesError) throw candidatesError;

    const stats = {
      total_candidates: candidates?.length || 0,
      invited: candidates?.filter(c => c.status === 'invited').length || 0,
      applied: candidates?.filter(c => c.status === 'applied').length || 0,
      ai_analyzed: candidates?.filter(c => c.status === 'ai_analyzed').length || 0,
      screening: candidates?.filter(c => c.status === 'screening').length || 0,
      interview_scheduled: candidates?.filter(c => c.status === 'interview_scheduled').length || 0,
      hired: candidates?.filter(c => c.status === 'hired').length || 0,
      rejected: candidates?.filter(c => c.status === 'rejected').length || 0,
      high_match: candidates?.filter(c => (c.match_score || 0) >= 80).length || 0,
      medium_match: candidates?.filter(c => (c.match_score || 0) >= 60 && (c.match_score || 0) < 80).length || 0,
      low_match: candidates?.filter(c => (c.match_score || 0) < 60).length || 0,
    };

    return stats;
  }

  // N8N Integration
  async submitToN8N(candidate: RecruitmentCandidate) {
    const n8nEndpoint = 'https://n8n-railway-production-369c.up.railway.app/form-test/automation-specialist-supabase';
    
    const payload = {
      name: `${candidate.first_name} ${candidate.last_name}`,
      email: candidate.email,
      phone: candidate.phone || '',
      position: candidate.position,
      experience: candidate.experience || '',
      skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills || '',
      resume_url: candidate.resume_url || '',
      candidate_id: candidate.id,
      token: candidate.token,
    };

    try {
      const response = await fetch(n8nEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`N8N submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting to N8N:', error);
      throw error;
    }
  }
}

export const recruitmentService = new RecruitmentService();
export default recruitmentService;
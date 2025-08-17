import { supabase } from '@/integrations/supabase/client';

class DatabaseMigrationService {
  async createRecruitmentTables(): Promise<void> {
    console.log('Creating recruitment tables...');

    try {
      // Create recruitment_candidates table
      const { error: candidatesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS recruitment_candidates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            match_score NUMERIC,
            position TEXT,
            phone TEXT,
            experience TEXT,
            skills TEXT[],
            resume_url TEXT,
            token TEXT UNIQUE,
            first_name TEXT,
            last_name TEXT,
            applied_at TIMESTAMP,
            invited_at TIMESTAMP,
            invited_by TEXT,
            ai_analysis JSONB,
            screening_questions JSONB,
            interview_scheduled_at TIMESTAMP,
            user_id UUID REFERENCES auth.users(id)
          );

          -- Create index for token lookup
          CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_token ON recruitment_candidates(token);
          CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_email ON recruitment_candidates(email);
          CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_status ON recruitment_candidates(status);

          -- Enable RLS
          ALTER TABLE recruitment_candidates ENABLE ROW LEVEL SECURITY;

          -- Allow public read/write for application submissions
          CREATE POLICY IF NOT EXISTS "Public can read recruitment_candidates" ON recruitment_candidates
            FOR SELECT USING (true);
          
          CREATE POLICY IF NOT EXISTS "Public can update recruitment_candidates" ON recruitment_candidates
            FOR UPDATE USING (true);

          CREATE POLICY IF NOT EXISTS "Authenticated users can manage recruitment_candidates" ON recruitment_candidates
            FOR ALL USING (auth.role() = 'authenticated');
        `
      });

      if (candidatesError && !candidatesError.message.includes('does not exist')) {
        console.error('Error creating recruitment_candidates:', candidatesError);
      } else {
        console.log('✅ recruitment_candidates table ready');
      }

      // Create recruitment_jobs table
      const { error: jobsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS recruitment_jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            requirements TEXT[],
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            location TEXT,
            salary_range TEXT,
            employment_type TEXT,
            status TEXT DEFAULT 'active',
            user_id UUID REFERENCES auth.users(id)
          );

          ALTER TABLE recruitment_jobs ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Authenticated users can manage recruitment_jobs" ON recruitment_jobs
            FOR ALL USING (auth.role() = 'authenticated');
        `
      });

      if (jobsError && !jobsError.message.includes('does not exist')) {
        console.error('Error creating recruitment_jobs:', jobsError);
      } else {
        console.log('✅ recruitment_jobs table ready');
      }

      // Create email_templates table
      const { error: templatesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS email_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            subject TEXT,
            body TEXT,
            type TEXT DEFAULT 'invitation',
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Authenticated users can manage email_templates" ON email_templates
            FOR ALL USING (auth.role() = 'authenticated');

          -- Insert default templates if they don't exist
          INSERT INTO email_templates (name, subject, body, type, is_default)
          SELECT 'Default Invitation', 'Job Application Invitation - {{position}}', 
            'Hi {{first_name}},\n\nWe found your profile interesting for our {{position}} role. Please complete your application using the link below:\n\n{{application_link}}\n\nBest regards,\nHR Team', 
            'invitation', true
          WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Invitation');
        `
      });

      if (templatesError && !templatesError.message.includes('does not exist')) {
        console.error('Error creating email_templates:', templatesError);
      } else {
        console.log('✅ email_templates table ready');
      }

      // Create email_batches table
      const { error: batchesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS email_batches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            template_id UUID REFERENCES email_templates(id),
            candidate_ids UUID[],
            sent_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_by TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
          );

          ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Authenticated users can manage email_batches" ON email_batches
            FOR ALL USING (auth.role() = 'authenticated');
        `
      });

      if (batchesError && !batchesError.message.includes('does not exist')) {
        console.error('Error creating email_batches:', batchesError);
      } else {
        console.log('✅ email_batches table ready');
      }

      console.log('✅ All recruitment tables created successfully');

    } catch (error) {
      console.error('Migration error:', error);
      
      // Fallback: Try direct table creation without RPC  
      try {
        await this.createTablesDirectly();
      } catch (fallbackError) {
        console.error('Fallback migration also failed:', fallbackError);
        throw new Error('Failed to create database tables. Please check Supabase configuration.');
      }
    }
  }

  private async createTablesDirectly() {
    console.log('Trying direct table creation...');

    // Test if we can create tables directly
    const { error } = await supabase
      .from('recruitment_candidates')
      .select('count(*)')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      throw new Error('Tables do not exist and cannot be created automatically. Please run the SQL migration manually in Supabase.');
    }

    console.log('✅ Tables exist or were created successfully');
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('recruitment_candidates')
        .select('count(*)')
        .limit(1);

      if (error) {
        console.log('Database connection test failed:', error.message);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
}

export const databaseMigration = new DatabaseMigrationService();
export default databaseMigration;
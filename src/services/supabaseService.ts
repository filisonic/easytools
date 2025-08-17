import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Candidate = Tables<'candidates'>;
export type Job = Tables<'jobs'>;
export type CandidateInsert = TablesInsert<'candidates'>;
export type JobInsert = TablesInsert<'jobs'>;
export type CandidateUpdate = TablesUpdate<'candidates'>;
export type JobUpdate = TablesUpdate<'jobs'>;

class SupabaseService {
  // Candidate Management
  async getCandidates(): Promise<Candidate[]> {
    console.log('Fetching candidates from Supabase...');
    
    // Get current user to understand RLS context
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for candidates fetch:', user?.id);
    
    // Try multiple approaches to get candidates
    let data, error;
    
    // Approach 1: Normal query
    const normalResult = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (normalResult.data && normalResult.data.length > 0) {
      console.log('Normal query succeeded:', normalResult.data.length, 'candidates');
      return normalResult.data;
    }
    
    // Approach 2: Try with service role (bypass RLS)
    // This would work if we had service role key, but we're using public key
    console.log('Normal query returned empty, checking RLS policies...');
    
    // Approach 3: Check if user has admin role and try admin functions
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id || '')
        .single();
      
      console.log('User role:', roleData?.role);
      
      if (roleData?.role === 'admin') {
        console.log('User is admin, attempting admin query...');
        // For now, still use the normal query but log that user is admin
        data = normalResult.data;
        error = normalResult.error;
      } else {
        data = normalResult.data;
        error = normalResult.error;
      }
    } catch (roleError) {
      console.log('Could not check user role:', roleError);
      data = normalResult.data;
      error = normalResult.error;
    }

    console.log('Final candidates response:', { data, error, count: data?.length || 0 });

    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }

    return data || [];
  }

  async createCandidate(candidate: CandidateInsert): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single();

    if (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }

    return data;
  }

  async updateCandidate(id: string, updates: CandidateUpdate): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }

    return data;
  }

  async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  // Job Management
  async getJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    return data || [];
  }

  async createJob(job: JobInsert): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data;
  }

  async updateJob(id: string, updates: JobUpdate): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }

    return data;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }

    return data;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [candidatesResult, jobsResult] = await Promise.all([
      supabase.from('candidates').select('status'),
      supabase.from('jobs').select('status')
    ]);

    const candidates = candidatesResult.data || [];
    const jobs = jobsResult.data || [];

    const statusCounts = candidates.reduce((acc, candidate) => {
      const status = candidate.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_candidates: candidates.length,
      active_candidates: statusCounts.active || 0,
      placed_candidates: statusCounts.placed || 0,
      inactive_candidates: statusCounts.inactive || 0,
      high_rating: candidates.filter(c => (c as any).rating >= 4).length,
      medium_rating: candidates.filter(c => (c as any).rating >= 3 && (c as any).rating < 4).length,
      low_rating: candidates.filter(c => (c as any).rating < 3).length,
      recent_applications: candidates.filter(c => {
        const createdAt = new Date(c.created_at || '');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length,
      positions: candidates.reduce((acc, candidate) => {
        const position = candidate.position || 'Unknown';
        acc[position] = (acc[position] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_jobs: jobs.length,
      active_jobs: jobs.filter(j => j.status === 'active').length,
      last_updated: new Date().toISOString()
    };
  }

  // Application Pipeline (using candidates table with position matching)
  async getCandidatesByJob(jobId?: string): Promise<Candidate[]> {
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobId) {
      // If we have a job ID, we can match by position or add a job_id field later
      const job = await this.getJobById(jobId);
      if (job) {
        query = query.eq('position', job.title);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching candidates by job:', error);
      throw error;
    }

    return data || [];
  }

  // Update candidate status (for pipeline movement)
  async updateCandidateStatus(candidateId: string, status: string, notes?: string): Promise<Candidate> {
    const updates: CandidateUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add notes to ai_analysis field if provided
    if (notes) {
      updates.ai_analysis = { notes, updated_at: new Date().toISOString() };
    }

    return this.updateCandidate(candidateId, updates);
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
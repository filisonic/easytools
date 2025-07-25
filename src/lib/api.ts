const API_BASE = 'https://n8n-railway-production-369c.up.railway.app/webhook';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: string;
  description: string;
  requirements: string[];
  status: 'active' | 'draft' | 'paused' | 'closed';
  posted_date: string;
  created_at: string;
  applicants_count?: number;
}

export const jobsAPI = {
  // Get all jobs
  async getAll() {
    const response = await fetch(`${API_BASE}/easyhrtools-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_all' })
    });
    
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  // Create new job
  async create(jobData: {
    title: string;
    company: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'remote';
    salary: string;
    description: string;
    requirements: string[];
  }) {
    const response = await fetch(`${API_BASE}/easyhrtools-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        ...jobData
      })
    });
    
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  // Update job
  async update(id: string, jobData: any) {
    const response = await fetch(`${API_BASE}/easyhrtools-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        id,
        ...jobData
      })
    });
    
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  },

  // Delete job
  async delete(id: string) {
    const response = await fetch(`${API_BASE}/easyhrtools-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        id
      })
    });
    
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  }
};

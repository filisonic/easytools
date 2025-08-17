export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: string;
  description: string;
  requirements: string[];
  status: 'draft' | 'active' | 'paused' | 'closed';
  applicants_count: number;
  posted_date: string;
  deadline?: string;
  created_at: string;
} 
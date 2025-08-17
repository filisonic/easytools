export interface Candidate {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience?: string;
  skills?: string[];
  cover_letter?: string;
  resume_url?: string;
  applied_at?: string;
  status?: 'active' | 'inactive' | 'placed';
  rating?: number;
  match_score?: number;
  ai_analysis?: any;
}

export interface Job {
  id?: string;
  title: string;
  description: string;
  requirements: string[];
  location?: string;
  salary_range?: string;
  department?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  status?: 'active' | 'inactive' | 'closed';
  created_at?: string;
}

export interface Application {
  id?: string;
  candidate_id: string;
  job_id: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  stage: string;
  notes?: string;
  applied_at?: string;
  updated_at?: string;
}

export interface InterviewSchedule {
  id?: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  interviewer_email?: string;
  candidate_email?: string; // Add candidate email field
  candidate_name?: string; // Add candidate name field  
  job_title?: string; // Add job title field
  scheduled_date?: string;
  interview_type: 'phone' | 'video' | 'in-person' | 'technical';
  status: 'scheduled' | 'sent' | 'completed' | 'cancelled' | 'pending_candidate_selection';
  scheduling_mode?: 'manual' | 'self_schedule'; // Add scheduling mode
  scheduling_link?: string; // For candidate self-scheduling
  questions?: InterviewQuestion[];
  exercise?: TechnicalExercise;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewQuestion {
  id?: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'cultural';
  expected_answer?: string;
  skills?: string[];
}

export interface TechnicalExercise {
  id?: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit?: number;
  instructions: string;
  starter_code?: string;
  test_cases?: string[];
}

export interface DashboardStats {
  total_candidates: number;
  active_candidates: number;
  placed_candidates: number;
  inactive_candidates: number;
  high_rating: number;
  medium_rating: number;
  low_rating: number;
  recent_applications: number;
  positions: Record<string, number>;
  last_updated: string;
}

export interface N8NResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  candidate_id?: string;
  job_id?: string;
  match_score?: number;
  analysis?: any;
  error?: string;
  message?: string;
}

export interface ScheduledWorkflow {
  id: string;
  name: string;
  type: 'email_reminder' | 'status_update' | 'data_sync' | 'ai_screening' | 'custom';
  schedule: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  description?: string;
  config?: any;
  created_at?: string;
  updated_at?: string;
}

export class N8NError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'N8NError';
    this.status = status;
    this.code = code;
  }
}
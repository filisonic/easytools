export interface RecruitmentCandidate {
  id?: string;
  token: string; // Unique application token
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience?: string;
  skills?: string[];
  resume_url?: string;
  status: 'invited' | 'applied' | 'ai_analyzed' | 'screening' | 'interview_scheduled' | 'hired' | 'rejected';
  match_score?: number;
  ai_analysis?: any;
  screening_questions?: ScreeningQuestion[];
  interview_scheduled_at?: string;
  invited_by?: string; // Recruiter who sent the invite
  invited_at?: string;
  applied_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScreeningQuestion {
  id?: string;
  question: string;
  answer?: string;
  score?: number;
  category: 'technical' | 'behavioral' | 'experience';
}

export interface BulkCandidateImport {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reminder' | 'rejection' | 'interview_scheduled';
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailBatch {
  id?: string;
  template_id: string;
  candidate_ids: string[];
  sent_count: number;
  failed_count: number;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  created_by?: string;
  created_at?: string;
  completed_at?: string;
}

export interface GmailOAuthState {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  email?: string;
  is_connected: boolean;
}
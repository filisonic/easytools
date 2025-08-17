-- Recruitment Pipeline Tables for Supabase

-- Recruitment Candidates Table
CREATE TABLE IF NOT EXISTS recruitment_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(255) NOT NULL,
  experience TEXT,
  skills TEXT[], -- Array of skills
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'applied', 'ai_analyzed', 'screening', 'interview_scheduled', 'hired', 'rejected')),
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  ai_analysis JSONB,
  screening_questions JSONB,
  interview_scheduled_at TIMESTAMPTZ,
  invited_by VARCHAR(255),
  invited_at TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('invitation', 'reminder', 'rejection', 'interview_scheduled')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Batches Table
CREATE TABLE IF NOT EXISTS email_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  candidate_ids UUID[],
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed')),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Gmail OAuth State Table
CREATE TABLE IF NOT EXISTS gmail_oauth_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  email VARCHAR(255),
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_token ON recruitment_candidates(token);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_email ON recruitment_candidates(email);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_status ON recruitment_candidates(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_position ON recruitment_candidates(position);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_created_at ON recruitment_candidates(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE recruitment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_oauth_state ENABLE ROW LEVEL SECURITY;

-- Allow public access to recruitment_candidates for application submission
CREATE POLICY "Public can apply via token" ON recruitment_candidates
  FOR UPDATE USING (true);

CREATE POLICY "Public can read via token" ON recruitment_candidates
  FOR SELECT USING (true);

-- Authenticated users can manage recruitment data
CREATE POLICY "Authenticated users can manage recruitment_candidates" ON recruitment_candidates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email_templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email_batches" ON email_batches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their oauth state" ON gmail_oauth_state
  FOR ALL USING (auth.uid()::text = user_id);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, type, is_default) VALUES 
(
  'Default Invitation',
  'Job Application Invitation - {{position}}',
  'Hi {{first_name}},

We found your profile interesting for our {{position}} role. Please complete your application using the link below:

{{application_link}}

Best regards,
HR Team',
  'invitation',
  true
),
(
  'Default Reminder',
  'Reminder: Complete Your Application - {{position}}',
  'Hi {{first_name}},

This is a friendly reminder to complete your application for the {{position}} role.

{{application_link}}

Best regards,
HR Team',
  'reminder',
  true
),
(
  'Interview Scheduled',
  'Interview Scheduled - {{position}}',
  'Hi {{first_name}},

Your interview for the {{position}} role has been scheduled for {{interview_date}}.

Details will follow shortly.

Best regards,
HR Team',
  'interview_scheduled',
  true
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recruitment_candidates_updated_at BEFORE UPDATE ON recruitment_candidates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gmail_oauth_state_updated_at BEFORE UPDATE ON gmail_oauth_state FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
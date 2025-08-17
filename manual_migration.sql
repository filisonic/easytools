-- Manual SQL migration for Recruitment Pipeline Tables
-- Run this in your Supabase SQL editor if automatic table creation fails

-- Create recruitment_candidates table
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
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'applied', 'ai_analyzed', 'screening', 'interview_scheduled', 'hired', 'rejected')),
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  ai_analysis JSONB,
  screening_questions JSONB,
  interview_scheduled_at TIMESTAMPTZ,
  invited_by TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'invitation' CHECK (type IN ('invitation', 'reminder', 'rejection', 'interview_scheduled')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_batches table
CREATE TABLE IF NOT EXISTS email_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  candidate_ids UUID[],
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_token ON recruitment_candidates(token);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_email ON recruitment_candidates(email);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_status ON recruitment_candidates(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_position ON recruitment_candidates(position);

-- Enable Row Level Security
ALTER TABLE recruitment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for recruitment_candidates
DROP POLICY IF EXISTS "Public can read recruitment_candidates" ON recruitment_candidates;
CREATE POLICY "Public can read recruitment_candidates" ON recruitment_candidates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update recruitment_candidates" ON recruitment_candidates;
CREATE POLICY "Public can update recruitment_candidates" ON recruitment_candidates
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Authenticated can manage recruitment_candidates" ON recruitment_candidates;
CREATE POLICY "Authenticated can manage recruitment_candidates" ON recruitment_candidates
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS policies for email_templates
DROP POLICY IF EXISTS "Authenticated can manage email_templates" ON email_templates;
CREATE POLICY "Authenticated can manage email_templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS policies for email_batches
DROP POLICY IF EXISTS "Authenticated can manage email_batches" ON email_batches;
CREATE POLICY "Authenticated can manage email_batches" ON email_batches
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default email template
INSERT INTO email_templates (name, subject, body, type, is_default)
SELECT 
  'Default Invitation', 
  'Job Application Invitation - {{position}}', 
  'Hi {{first_name}},

We found your profile interesting for our {{position}} role. Please complete your application using the link below:

{{application_link}}

Best regards,
HR Team', 
  'invitation', 
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Default Invitation');

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_recruitment_candidates_updated_at ON recruitment_candidates;
CREATE TRIGGER update_recruitment_candidates_updated_at 
  BEFORE UPDATE ON recruitment_candidates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
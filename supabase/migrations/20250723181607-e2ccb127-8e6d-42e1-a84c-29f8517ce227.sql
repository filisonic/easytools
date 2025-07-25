-- Add resume_url column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN resume_url TEXT;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true);

-- Create storage policies for resume uploads
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes');

CREATE POLICY "Anyone can update resumes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resumes');

CREATE POLICY "Anyone can delete resumes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'resumes');
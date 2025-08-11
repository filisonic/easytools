import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    experience: '',
    cover_letter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let resume_url = null;

      // Upload resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resume_url = urlData.publicUrl;
      }

      // Save to candidates table
      const { data: candidate, error: dbError } = await supabase
        .from('candidates')
        .insert({
          ...formData,
          resume_url,
          status: 'New Application',
          created_by: null // Allow null for public applications
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send to n8n webhook
      const webhookUrl = 'https://n8n-railway-production-369c.up.railway.app/webhook/easyhrtools-application';
      
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify({
            record: candidate,
            source: 'Lovable Application Form'
          }),
        });
      } catch (webhookError) {
        console.warn('Webhook notification failed:', webhookError);
      }

      toast({
        title: "Application Submitted Successfully!",
        description: "Your application has been submitted and sent to our recruitment team for review.",
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        experience: '',
        cover_letter: ''
      });
      setResumeFile(null);

    } catch (error) {
      console.error('Application submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Job Application</CardTitle>
        <CardDescription>
          Please fill out all required fields to submit your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <Textarea
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Tell us about your relevant experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Letter</label>
            <Textarea
              value={formData.cover_letter}
              onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
              placeholder="Why are you interested in this position?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resume</label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
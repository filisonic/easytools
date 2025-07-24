
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { ApplicationTabs } from './ApplicationTabs';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  coverLetter: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function JobApplicationForm() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [videoBlobs, setVideoBlobs] = useState<Blob[]>([]);
  const [activeTab, setActiveTab] = useState('application');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      yearsOfExperience: '',
      coverLetter: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!cvFile) {
      toast({
        title: 'CV Required',
        description: 'Please upload your CV to complete the application.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload resume to Supabase Storage
      let resumeUrl = null;
      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `resumes/${Date.now()}-${(data.firstName + '-' + data.lastName).replace(/\s+/g, '-')}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, cvFile);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      }

      // 2. Save candidate to Supabase
      const candidateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        experience: data.yearsOfExperience,
        cover_letter: data.coverLetter,
        resume_url: resumeUrl,
        status: 'New Application',
        created_by: '00000000-0000-0000-0000-000000000000' // Default system user for public applications
      };

      const { data: candidate, error: dbError } = await supabase
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Trigger n8n workflow if webhook URL is provided
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              record: candidate,
              source: 'Lovable Application Form'
            })
          });
        } catch (webhookError) {
          console.warn('n8n webhook failed, but application was saved:', webhookError);
        }
      }

      toast({
        title: 'Application Submitted!',
        description: 'Your job application has been submitted successfully. You can now proceed to the video interview section.',
      });

      setApplicationSubmitted(true);
      setActiveTab('interview');
      console.log('Application submitted successfully:', candidate);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoRecorded = (videoBlob: Blob) => {
    setVideoBlobs(prev => [...prev, videoBlob]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Job Application Process</CardTitle>
          <CardDescription>
            Complete your application in two steps: submit your details and CV, then record your video interview responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            applicationSubmitted={applicationSubmitted}
            form={form}
            onSubmit={onSubmit}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            cvFile={cvFile}
            setCvFile={setCvFile}
            isSubmitting={isSubmitting}
            onVideoRecorded={handleVideoRecorded}
          />
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { ApplicationTabs } from './ApplicationTabs';

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

    if (!webhookUrl) {
      toast({
        title: 'Webhook URL Required',
        description: 'Please enter your n8n webhook URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('First Name', data.firstName);
      formData.append('Last Name', data.lastName);
      formData.append('Email', data.email);
      formData.append('Phone', data.phone);
      formData.append('Years of experience', data.yearsOfExperience);
      if (data.coverLetter) {
        formData.append('Cover Letter', data.coverLetter);
      }
      formData.append('Upload_your_CV', cvFile);
      formData.append('application_type', 'standard_application');

      const response = await axios.post(webhookUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });

      toast({
        title: 'Application Submitted!',
        description: 'Your job application has been submitted successfully. You can now proceed to the video interview section.',
      });

      setApplicationSubmitted(true);
      setActiveTab('interview');
      console.log('Application submitted successfully:', response.data);

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


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Video } from 'lucide-react';
import { BasicApplicationForm } from './BasicApplicationForm';
import { VideoInterviewRecorder } from './VideoInterviewRecorder';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  coverLetter: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ApplicationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applicationSubmitted: boolean;
  form: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  isSubmitting: boolean;
  onVideoRecorded: (videoBlob: Blob) => void;
}

export function ApplicationTabs({
  activeTab,
  setActiveTab,
  applicationSubmitted,
  form,
  onSubmit,
  webhookUrl,
  setWebhookUrl,
  cvFile,
  setCvFile,
  isSubmitting,
  onVideoRecorded
}: ApplicationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="application" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Application Form
        </TabsTrigger>
        <TabsTrigger 
          value="interview" 
          disabled={!applicationSubmitted}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          Video Interview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="application" className="space-y-6 mt-6">
        <BasicApplicationForm
          form={form}
          onSubmit={onSubmit}
          webhookUrl={webhookUrl}
          setWebhookUrl={setWebhookUrl}
          cvFile={cvFile}
          setCvFile={setCvFile}
          isSubmitting={isSubmitting}
          applicationSubmitted={applicationSubmitted}
        />
      </TabsContent>

      <TabsContent value="interview" className="mt-6">
        {applicationSubmitted ? (
          <VideoInterviewRecorder 
            onVideoRecorded={onVideoRecorded}
            webhookUrl={webhookUrl}
          />
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Complete Your Application First</h3>
              <p className="text-muted-foreground">
                Please submit your application form before proceeding to the video interview.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

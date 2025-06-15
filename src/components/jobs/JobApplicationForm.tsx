import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, FileText, Video } from 'lucide-react';
import axios from 'axios';
import { VideoInterviewRecorder } from './VideoInterviewRecorder';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file only.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setCvFile(file);
    }
  };

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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Webhook URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="webhook">n8n Webhook URL</Label>
                    <Input
                      id="webhook"
                      type="url"
                      placeholder="https://your-n8n-instance/webhook/automation-specialist-application"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your n8n webhook URL to process the application
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="Enter years of experience" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Letter (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CV Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="cv">Upload CV (PDF only)*</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="cv"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> your CV
                          </p>
                          <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
                          {cvFile && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                              Selected: {cvFile.name}
                            </p>
                          )}
                        </div>
                        <input
                          id="cv"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || applicationSubmitted}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application...
                      </>
                    ) : applicationSubmitted ? (
                      'Application Submitted ✓'
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="interview" className="mt-6">
              {applicationSubmitted ? (
                <VideoInterviewRecorder 
                  onVideoRecorded={handleVideoRecorded}
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
        </CardContent>
      </Card>
    </div>
  );
}

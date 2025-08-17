import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseJobs } from '@/hooks/useSupabase';
import n8nService from '@/services/n8nService';
import { 
  Send, 
  Copy, 
  Link as LinkIcon, 
  Users, 
  FileText, 
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface HRResumeScreenerProps {
  jobId?: string;
}

export function HRResumeScreener({ jobId }: HRResumeScreenerProps) {
  const [candidateEmails, setCandidateEmails] = useState('');
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState(jobId || '');
  
  const { jobs, fetchJobs, loading: jobsLoading } = useSupabaseJobs();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Generate the screening form URL for mass distribution
  const getScreeningFormUrl = () => {
    // Updated to the production URL provided by the user
    const baseUrl = 'https://n8n-railway-production-369c.up.railway.app/form/automation-specialist-supabase';
    const selectedJobData = jobs.find(j => j.id === selectedJob);
    
    if (selectedJobData) {
      return `${baseUrl}?job_id=${selectedJob}&position=${encodeURIComponent(selectedJobData.title)}`;
    }
    return baseUrl;
  };

  const copyFormUrl = () => {
    const url = getScreeningFormUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Screening form URL copied to clipboard",
    });
  };

  // Parse email addresses from input
  const parseEmails = (emailText: string): string[] => {
    return emailText
      .split(/[,;\n\r]+/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
  };

  // Send screening links to multiple candidates
  const sendBulkScreeningLinks = async () => {
    const emails = parseEmails(candidateEmails);
    if (emails.length === 0) {
      toast({
        title: "Error",
        description: "No valid email addresses found.",
        variant: "destructive",
      });
      return;
    }

    const screeningUrl = getScreeningFormUrl();
    const selectedJobData = jobs.find(j => j.id === selectedJob);
    const jobTitle = selectedJobData?.title || 'Open Position';
    const subject = `Invitation to Apply for ${jobTitle}`;

    const defaultMessage = `Hi there!

We're excited to tell you about an opportunity for a ${jobTitle} position at our company.

To get started with the application process, please complete our quick screening form:
${screeningUrl}

This form will help us understand your background and match you with the right opportunities.

Looking forward to learning more about you!

Best regards,
The HR Team`;

    const body = personalizedMessage.trim() || defaultMessage;

    setSending(true);
    try {
      const result = await n8nService.sendMassEmail(emails, subject, body, screeningUrl, 'HR Team');
      if (result.success) {
        toast({
          title: "Screening Invitations Sent",
          description: `Successfully sent invitations to ${emails.length} candidates.`,
        });
        setCandidateEmails('');
        setPersonalizedMessage('');
      } else {
        throw new Error(result.message || 'Failed to send invitations.');
      }
    } catch (error) {
      toast({
        title: "Error Sending Invitations",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Test function to trigger the HR Resume Screener workflow directly
  const testN8NWorkflow = async () => {
    if (!selectedJob) {
      toast({ title: "Please select a job first.", variant: "destructive" });
      return;
    }

    const selectedJobData = jobs.find(j => j.id === selectedJob);

    const sampleCandidateData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      position: selectedJobData?.title || 'Test Position',
      experience: '1 year',
      skills: ['JavaScript', 'React'],
      // Placeholder base64 for a PDF. In a real scenario, this would come from a file upload.
      resume_file: 'JVBERi0xLjQKJcOkw7zDtsO1CjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSL1N0cnVjdFRyZWVSb290IDQgMCBSPj4KZW5kb2JqCgoyIDAgb2JqCjw8L1R5cGUvUGFnZXN0L0NvdW50IDEvS2lkc1sgMyAwIFJdPj4KZW5kb2JqCgozIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDYgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvT2JqZWN0UG9sL1N0cnVjdFRyZWVSb290IDQgMCBSL01lZGlhQm94Wy0xMC0xMC0xMC0xMF0+PgplbmRvYmoKCi81IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYTw8L05hbWUvRk9OMi9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+Pj4+PgplbmRvYmoKCi82IDAgb2JqCjw8L1R5cGUvQ29udGVudHMvc3RyZWFtCkJUCi9GMSAxMiBUZihIZWxsbywgV29ybGQhKSBUagpFbmoKZW5kb2JqCgp4cmVmCjAgOwo3IDAgUgo8PC9TaXplLzgvUm9vdCAxIDAgUj4+CnN0YW0KPDwvRmlsZW5hbWUvYnVuZGxlL0ZpbGVEZXRlY3Rvci9ub25lPj4+CjEwIDAwMDAwMDAwMDAgNjU1MzUgZiAKMTgwMDAwMDAwMDAgMDAwMDAuIG4KMTkwMDAwMDAwMDAgMDAwMDAuIG4KMjAwMDAwMDAwMDAgMDAwMDAuIG4KMjEwMDAwMDAwMDAgMDAwMDAuIG4KMjIwMDAwMDAwMDAgMDAwMDAuIG4KZW5kb2Z4Cg%3D%3D',
      job_id: selectedJob
    };

    try {
      toast({ title: "Testing N8N workflow...", description: "Submitting sample candidate data." });
      const result = await n8nService.triggerHRResumeScreenerSupabaseComplete(sampleCandidateData);
      
      if (result.success) {
        toast({ 
          title: "Workflow Test Successful", 
          description: `Candidate ${sampleCandidateData.first_name} submitted. Screening result: ${JSON.stringify(result.data?.screening_result || result.data)}`,
          variant: "default" // Fixed TS error: changed from "success" to "default"
        });
      } else {
        toast({ 
          title: "Workflow Test Failed", 
          description: result.message || "An unknown error occurred.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ 
        title: "Error during workflow test", 
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HR Resume Screener - Mass Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Send screening form links to multiple candidates at once using your N8N "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Job Position</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={jobsLoading}
            >
              <option value="">Select a job position</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} {/* Removed .department to fix TS error */}
                </option>
              ))}
            </select>
          </div>

          {/* Screening Form URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Screening Form URL</label>
            <div className="flex gap-2">
              <Input
                value={getScreeningFormUrl()}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                onClick={copyFormUrl}
                size="sm"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This URL will trigger your "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow
            </p>
          </div>

          {/* Candidate Emails Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Candidate Email Addresses</label>
            <Textarea
              placeholder="Enter email addresses separated by commas, semicolons, or new lines:
candidate1@example.com
candidate2@example.com, candidate3@example.com"
              value={candidateEmails}
              onChange={(e) => setCandidateEmails(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {parseEmails(candidateEmails).length} valid email{parseEmails(candidateEmails).length !== 1 ? 's' : ''} detected
            </div>
          </div>

          {/* Personalized Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Personalized Message (Optional)</label>
            <Textarea
              placeholder="Enter a personalized message for candidates. If left empty, a default professional message will be used."
              value={personalizedMessage}
              onChange={(e) => setPersonalizedMessage(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              The screening form URL will be automatically included in the message
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={sendBulkScreeningLinks}
            disabled={sending || !candidateEmails.trim() || !selectedJob}
            className="w-full"
            size="lg"
          >
            {sending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitations... ({sentCount} sent)
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Screening Invitations ({parseEmails(candidateEmails).length} recipients)
              </>
            )}
          </Button>

          {/* Test Workflow Button */}
          <Button
            onClick={testN8NWorkflow}
            disabled={!selectedJob || sending} // Disable if no job selected or if sending emails
            className="w-full"
            variant="outline" // Use outline variant to distinguish from send button
          >
            <Send className="h-4 w-4 mr-2" />
            Test HR Resume Screener Workflow
          </Button>

          {/* Results Display */}
          {(sentCount > 0 || errors.length > 0) && (
            <div className="space-y-3 pt-4 border-t">
              {sentCount > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Successfully sent to {sentCount} candidate{sentCount > 1 ? 's' : ''}</span>
                </div>
              )}
              
              {errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Failed to send to {errors.length} candidate{errors.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-red-50 rounded p-2">
                    {errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-700 mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Workflow Integration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>N8N Workflow:</strong>
              <p className="text-muted-foreground">HR Resume Screener - Supabase Complete (Binary Fixed Final)</p>
            </div>
            <div>
              <strong>Webhook URL:</strong>
              <p className="font-mono text-muted-foreground break-all">
                https://n8n-railway-production-369c.up.railway.app/form/automation-specialist-supabase
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <strong>How it works:</strong>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1 mt-1">
              <li>Candidates receive email with screening form link</li>
              <li>They fill out the form with resume upload</li>
              <li>N8N workflow processes their application automatically</li>
              <li>Results appear in your pipeline with AI analysis</li>
              <li>You can track all submissions in the ATS system</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

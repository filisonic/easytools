import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useInterview } from '@/hooks/useInterview';
import { 
  Calendar, 
  Mail, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  Code,
  Plus,
  Trash2
} from 'lucide-react';
import { InterviewSchedule, InterviewQuestion, TechnicalExercise, Candidate, Job } from '@/types/n8n';

interface InterviewSchedulerProps {
  candidate?: Candidate;
  job?: Job;
  applicationId?: string;
  standalone?: boolean; // For use on dedicated interviews page
}

export function InterviewScheduler({ candidate, job, applicationId, standalone = false }: InterviewSchedulerProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSchedule | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [generatedExercise, setGeneratedExercise] = useState<TechnicalExercise | null>(null);
  
  const [scheduleData, setScheduleData] = useState({
    interview_type: 'video' as const,
    scheduled_date: '',
    interviewer_email: '',
    candidate_email: '', // Add candidate email field
    candidate_name: '', // Add candidate name field
    job_title: '', // Add job title field
    scheduling_mode: 'manual' as 'manual' | 'self_schedule', // Add scheduling mode
    notes: ''
  });

  const [emailData, setEmailData] = useState({
    interviewer_name: '',
    interview_date: '',
    custom_message: ''
  });

  const { 
    interviews, 
    loading, 
    scheduleInterview,
    scheduleInterviewWithAI, 
    sendInterviewEmail, 
    generateQuestions, 
    generateExercise,
    updateInterviewStatus,
    fetchInterviews 
  } = useInterview();

  const { toast } = useToast();

  useEffect(() => {
    // Always fetch interviews - now has proper fallback handling
    fetchInterviews().catch(error => {
      console.warn('Failed to fetch interviews - using demo mode:', error);
    });
    
    // Pre-fill candidate and job data if provided
    if (candidate && job) {
      setScheduleData(prev => ({
        ...prev,
        candidate_email: candidate.email || '',
        candidate_name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
        job_title: job.title || ''
      }));
    }
  }, [fetchInterviews, candidate, job]);

  const handleScheduleInterview = async () => {
    // Allow scheduling even without pre-filled candidate/job data
    const candidateEmail = scheduleData.candidate_email || candidate?.email;
    const candidateName = scheduleData.candidate_name || `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim();
    const jobTitle = scheduleData.job_title || job?.title;

    if (!candidateEmail || !candidateName || !jobTitle) {
      toast({
        title: "Error",
        description: "Please fill in candidate email, name, and job title",
        variant: "destructive",
      });
      return;
    }

    // Validation depends on scheduling mode
    if (scheduleData.scheduling_mode === 'manual') {
      if (!scheduleData.scheduled_date || !scheduleData.interviewer_email) {
        toast({
          title: "Error", 
          description: "Please fill in the scheduled date and your email for manual scheduling",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For self-scheduling, we only need interviewer email
      if (!scheduleData.interviewer_email) {
        toast({
          title: "Error", 
          description: "Please fill in your email address",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const interviewData: InterviewSchedule = {
        application_id: applicationId || `app-${Date.now()}`,
        candidate_id: candidate?.id || `candidate-${Date.now()}`,
        job_id: job?.id || `job-${Date.now()}`,
        interview_type: scheduleData.interview_type,
        scheduled_date: scheduleData.scheduling_mode === 'manual' ? scheduleData.scheduled_date : undefined,
        interviewer_email: scheduleData.interviewer_email,
        candidate_email: candidateEmail, // Use the actual entered email
        candidate_name: candidateName, // Use the actual entered name
        job_title: jobTitle, // Use the actual job title
        scheduling_mode: scheduleData.scheduling_mode,
        status: scheduleData.scheduling_mode === 'manual' ? 'scheduled' : 'pending_candidate_selection',
        questions: generatedQuestions,
        exercise: generatedExercise || undefined
      };

      console.log(`${scheduleData.scheduling_mode === 'self_schedule' ? '🤖 AI' : '📅 Manual'} Scheduling interview with data:`, interviewData);
      
      const result = scheduleData.scheduling_mode === 'self_schedule' 
        ? await scheduleInterviewWithAI(interviewData)
        : await scheduleInterview(interviewData);
      console.log('Interview scheduled successfully:', result);
      
      // Log more details for debugging
      console.log('Interview result type:', typeof result);
      console.log('Interview result keys:', Object.keys(result || {}));

      // Show success message based on scheduling mode
      if (scheduleData.scheduling_mode === 'self_schedule') {
        toast({
          title: "AI Interview Scheduling Started!",
          description: `${candidateName} will receive a scheduling link to pick their preferred time. Email sent to ${candidateEmail}`,
        });
      } else {
        toast({
          title: "Interview Scheduled!",
          description: `Interview scheduled for ${new Date(scheduleData.scheduled_date).toLocaleString()}. Email will be sent to ${candidateEmail}`,
        });
      }

      // Reset form
      setShowScheduleForm(false);
      setScheduleData({
        interview_type: 'video',
        scheduled_date: '',
        interviewer_email: '',
        candidate_email: '',
        candidate_name: '',
        job_title: '',
        scheduling_mode: 'manual',
        notes: ''
      });
      setGeneratedQuestions([]);
      setGeneratedExercise(null);

      // Refresh interviews list to show the new interview - no delay needed since we add locally first
      fetchInterviews().catch(err => {
        console.warn('Failed to refresh interviews after scheduling:', err);
        // This is fine since we already added the interview locally
      });

    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendInterviewEmail = async (interview: InterviewSchedule) => {
    try {
      const emailPayload = {
        candidate_email: interview.candidate_email || candidate?.email || '',
        candidate_name: interview.candidate_name || `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim(),
        job_title: interview.job_title || job?.title || '',
        questions: interview.questions || [],
        exercise: interview.exercise,
        interviewer_name: emailData.interviewer_name,
        interviewer_email: interview.interviewer_email,
        interview_date: emailData.interview_date || interview.scheduled_date
      };

      await sendInterviewEmail(interview.id!, emailPayload);
      await updateInterviewStatus(interview.id!, 'sent');
    } catch (error) {
      console.error('Failed to send interview email:', error);
    }
  };

  const handleGenerateQuestions = async () => {
    const jobTitle = scheduleData.job_title || job?.title;
    if (!jobTitle) {
      toast({
        title: "Error",
        description: "Please enter a job title first",
        variant: "destructive",
      });
      return;
    }

    try {
      const questions = await generateQuestions(jobTitle, candidate?.skills || []);
      setGeneratedQuestions(questions);
      toast({
        title: "Success",
        description: "Interview questions generated successfully",
      });
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Show fallback questions for any job
      const fallbackQuestions: InterviewQuestion[] = [
        {
          id: 'q1',
          question: `Tell me about your experience relevant to this ${jobTitle} position.`,
          category: 'behavioral',
          skills: []
        },
        {
          id: 'q2',
          question: `What interests you most about this ${jobTitle} role?`,
          category: 'cultural',
          skills: []
        },
        {
          id: 'q3',
          question: `Describe a challenging project you worked on. How did you overcome the obstacles?`,
          category: 'behavioral',
          skills: []
        },
        {
          id: 'q4',
          question: `Where do you see yourself in 3-5 years in your career?`,
          category: 'cultural',
          skills: []
        }
      ];
      setGeneratedQuestions(fallbackQuestions);
      toast({
        title: "Questions Generated",
        description: "Using fallback questions since AI generation is unavailable",
      });
    }
  };

  const handleGenerateExercise = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const jobTitle = scheduleData.job_title || job?.title || 'Developer';
    const skills = candidate?.skills || ['General Programming'];

    try {
      const exercise = await generateExercise(skills, difficulty);
      setGeneratedExercise(exercise);
      toast({
        title: "Success",
        description: "Technical exercise generated successfully",
      });
    } catch (error) {
      console.error('Failed to generate exercise:', error);
      // Show fallback exercise
      const fallbackExercise: TechnicalExercise = {
        id: 'fallback-exercise',
        title: `${jobTitle} Coding Challenge`,
        description: `A ${difficulty} level coding challenge for the ${jobTitle} position`,
        skills: skills,
        difficulty: difficulty,
        time_limit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 90,
        instructions: `Please solve this coding problem within the time limit. 

Requirements:
1. Write clean, readable code
2. Consider edge cases
3. Optimize for performance where possible
4. Add comments where necessary

Good luck!`,
        starter_code: `// ${jobTitle} coding challenge
// Write your solution here

function solution() {
    // Your code here
    return null;
}`,
        test_cases: [
          "Function exists and is callable",
          "Handles basic input correctly",
          "Handles edge cases",
          "Code is well-structured"
        ]
      };
      setGeneratedExercise(fallbackExercise);
      toast({
        title: "Exercise Generated",
        description: "Using fallback exercise since AI generation is unavailable",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      case 'pending_candidate_selection': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string, schedulingMode?: string) => {
    switch (status) {
      case 'pending_candidate_selection': return schedulingMode === 'self_schedule' ? 'Pending Selection' : 'Pending';
      case 'scheduled': return 'Scheduled';
      case 'sent': return 'Email Sent';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return '📞';
      case 'video': return '🎥';
      case 'in-person': return '👥';
      case 'technical': return '💻';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Interview Scheduler</h3>
          <p className="text-sm text-muted-foreground">
            Schedule interviews and send questions/exercises via n8n
          </p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)} size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Interview</CardTitle>
            {!standalone && candidate && job && (
              <p className="text-sm text-muted-foreground">
                For {candidate.first_name} {candidate.last_name} - {job.title}
              </p>
            )}
            {standalone && (
              <p className="text-sm text-muted-foreground">
                Enter candidate and job details below
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scheduling Mode Toggle */}
            <div className="space-y-4">
              <div>
                <Label>Scheduling Mode</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={scheduleData.scheduling_mode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setScheduleData(prev => ({ ...prev, scheduling_mode: 'manual' }))}
                    className="justify-start"
                  >
                    📅 Manual Scheduling
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleData.scheduling_mode === 'self_schedule' ? 'default' : 'outline'}
                    onClick={() => setScheduleData(prev => ({ ...prev, scheduling_mode: 'self_schedule' }))}
                    className="justify-start"
                  >
                    🤖 AI Self-Schedule
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {scheduleData.scheduling_mode === 'manual' 
                    ? 'Set a specific date and time for the interview'
                    : 'Let the candidate pick their preferred time using AI assistance'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-type">Interview Type</Label>
                <Select
                  value={scheduleData.interview_type}
                  onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, interview_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Phone Interview</SelectItem>
                    <SelectItem value="video">🎥 Video Interview</SelectItem>
                    <SelectItem value="in-person">👥 In-Person Interview</SelectItem>
                    <SelectItem value="technical">💻 Technical Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scheduleData.scheduling_mode === 'manual' && (
                <div>
                  <Label htmlFor="interview-date">Scheduled Date</Label>
                  <Input
                    id="interview-date"
                    type="datetime-local"
                    value={scheduleData.scheduled_date}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
              )}
              {scheduleData.scheduling_mode === 'self_schedule' && (
                <div className="flex items-center justify-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Scheduling</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">Candidate will choose time</div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate-email">Candidate Email</Label>
                <Input
                  id="candidate-email"
                  type="email"
                  value={scheduleData.candidate_email}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, candidate_email: e.target.value }))}
                  placeholder="candidate@email.com"
                />
              </div>
              <div>
                <Label htmlFor="interviewer-email">Your Email (Interviewer)</Label>
                <Input
                  id="interviewer-email"
                  type="email"
                  value={scheduleData.interviewer_email}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, interviewer_email: e.target.value }))}
                  placeholder="your-email@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate-name">Candidate Name</Label>
                <Input
                  id="candidate-name"
                  value={scheduleData.candidate_name}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, candidate_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  value={scheduleData.job_title}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="Frontend Developer"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Interview Questions</h4>
                <Button variant="outline" size="sm" onClick={handleGenerateQuestions} disabled={loading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Questions
                </Button>
              </div>
              
              {generatedQuestions.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatedQuestions.map((q, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary">{q.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGeneratedQuestions(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm">{q.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Technical Exercise</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleGenerateExercise('easy')} disabled={loading}>
                    <Code className="h-4 w-4 mr-2" />
                    Easy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerateExercise('medium')} disabled={loading}>
                    <Code className="h-4 w-4 mr-2" />
                    Medium
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerateExercise('hard')} disabled={loading}>
                    <Code className="h-4 w-4 mr-2" />
                    Hard
                  </Button>
                </div>
              </div>
              
              {generatedExercise && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{generatedExercise.title}</h5>
                    <Badge variant="outline">{generatedExercise.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{generatedExercise.description}</p>
                  <div className="flex gap-2 mb-2">
                    {generatedExercise.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                  {generatedExercise.time_limit && (
                    <p className="text-xs text-muted-foreground">Time limit: {generatedExercise.time_limit} minutes</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleScheduleInterview} disabled={loading}>
                Schedule Interview
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <Card key={interview.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {interview.scheduling_mode === 'self_schedule' ? '🤖' : getTypeIcon(interview.interview_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        Interview #{interview.id?.slice(-4)}
                        {interview.scheduling_mode === 'self_schedule' && (
                          <span className="text-xs text-blue-600 ml-2">AI Scheduling</span>
                        )}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(interview.status)} text-white`}
                      >
                        {getStatusText(interview.status, interview.scheduling_mode)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {interview.candidate_name || `Candidate ID: ${interview.candidate_id}`}
                      </div>
                      {interview.candidate_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {interview.candidate_email}
                        </div>
                      )}
                      {interview.job_title && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {interview.job_title}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {interview.scheduling_mode === 'self_schedule' && interview.status === 'pending_candidate_selection' 
                          ? 'Waiting for candidate to select time'
                          : interview.scheduled_date 
                            ? new Date(interview.scheduled_date).toLocaleString() 
                            : 'Not scheduled'
                        }
                      </div>
                      {interview.scheduling_link && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3" />
                          <a 
                            href={interview.scheduling_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Candidate Scheduling Link
                          </a>
                        </div>
                      )}
                      {interview.interviewer_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          Interviewer: {interview.interviewer_email}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {interview.questions?.length || 0} questions
                      </div>
                      {interview.exercise && (
                        <div className="flex items-center gap-2">
                          <Code className="h-3 w-3" />
                          Technical exercise included
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {interview.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInterview(interview);
                        handleSendInterviewEmail(interview);
                      }}
                      disabled={loading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                  <Select
                    value={interview.status}
                    onValueChange={(value) => updateInterviewStatus(interview.id!, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_candidate_selection">Pending Selection</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="sent">Email Sent</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {interviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No Interviews Scheduled</h4>
            <p className="text-muted-foreground mb-4">
              Schedule your first interview to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
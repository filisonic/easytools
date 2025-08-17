import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewScheduler } from '../interview/InterviewScheduler';
import { InterviewEmailPreview } from '../interview/InterviewEmailPreview';
import { HRResumeScreenerForm } from '../interview/HRResumeScreenerForm';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Code, FileText, Users, Clock, Search, Filter, UserCheck, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { useRecruitment } from '@/hooks/useN8N';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Candidate, Job, Application } from '@/types/n8n';
import n8nService from '@/services/n8nService';
import { useToast } from '@/components/ui/use-toast';

export function InterviewsPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [screeningResults, setScreeningResults] = useState<Record<string, {score: number, loading: boolean}>>({});
  const { candidates, jobs, applications } = useRecruitment();
  const { toast } = useToast();
  
  // Combined data for comprehensive pipeline view
  const [candidateApplications, setCandidateApplications] = useState<Array<{
    candidate: Candidate;
    job: Job;
    application: Application;
    screeningScore?: number;
  }>>([]);
  
  useEffect(() => {
    // Load initial data with error handling
    try {
      if (candidates?.fetchCandidates) candidates.fetchCandidates();
      if (jobs?.fetchJobs) jobs.fetchJobs();
      if (applications?.fetchApplications) applications.fetchApplications();
    } catch (error) {
      console.warn('Failed to load data:', error);
    }
  }, [candidates?.fetchCandidates, jobs?.fetchJobs, applications?.fetchApplications]);
  
  useEffect(() => {
    // Combine candidate, job, and application data with safe access
    if (candidates?.candidates?.length && jobs?.jobs?.length && applications?.applications?.length) {
      const combined = applications.applications.map(app => {
        const candidate = candidates.candidates.find(c => c.id === app.candidate_id);
        const job = jobs.jobs.find(j => j.id === app.job_id);
        const screeningScore = screeningResults[`${app.candidate_id}-${app.job_id}`]?.score;
        
        return {
          candidate: candidate || {} as Candidate,
          job: job || {} as Job,
          application: app,
          screeningScore
        };
      }).filter(item => item.candidate.id && item.job.id);
      
      setCandidateApplications(combined);
    }
  }, [candidates?.candidates, jobs?.jobs, applications?.applications, screeningResults]);
  
  const handleResumeScreening = async (candidateId: string, jobId: string) => {
    setScreeningResults(prev => ({
      ...prev,
      [`${candidateId}-${jobId}`]: { score: 0, loading: true }
    }));
    
    try {
      const result = await n8nService.screenResume(candidateId, jobId);
      if (result.success && result.match_score !== undefined) {
        setScreeningResults(prev => ({
          ...prev,
          [`${candidateId}-${jobId}`]: { score: result.match_score, loading: false }
        }));
        
        toast({
          title: "Resume Screening Complete",
          description: `Match score: ${result.match_score}%`,
        });
      }
    } catch (error) {
      setScreeningResults(prev => ({
        ...prev,
        [`${candidateId}-${jobId}`]: { score: 0, loading: false }
      }));
      
      toast({
        title: "Screening Failed",
        description: "Could not complete resume screening",
        variant: "destructive",
      });
    }
  };
  
  const filteredApplications = candidateApplications.filter(item => {
    const matchesSearch = 
      item.candidate.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidate.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default'; // green
    if (score >= 60) return 'outline'; // yellow
    return 'destructive'; // red
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Interview Management</h1>
          <p className="text-muted-foreground">
            Schedule interviews, generate questions, and manage the interview process
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Scheduler
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            AI Questions
          </Badge>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{candidates?.candidates?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{applications?.applications?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Matches</p>
                <p className="text-2xl font-bold">
                  {Object.values(screeningResults).filter(r => r.score >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{jobs?.jobs?.filter(j => j.status === 'active').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">HR Pipeline</TabsTrigger>
          <TabsTrigger value="screener">Resume Screener</TabsTrigger>
          <TabsTrigger value="scheduler">Interview Scheduler</TabsTrigger>
          <TabsTrigger value="preview">Email Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates or positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Comprehensive Pipeline Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                HR Resume Screener Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {candidateApplications.length === 0 
                      ? "Start by adding candidates and jobs to see the pipeline"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((item) => {
                        const screeningKey = `${item.candidate.id}-${item.job.id}`;
                        const screening = screeningResults[screeningKey];
                        
                        return (
                          <TableRow key={`${item.candidate.id}-${item.job.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.candidate.first_name} {item.candidate.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{item.candidate.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.job.title}</p>
                                <p className="text-sm text-muted-foreground">{item.job.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.application.status === 'hired' ? 'default' : 'outline'}>
                                {item.application.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {screening?.loading ? (
                                <Badge variant="outline">Analyzing...</Badge>
                              ) : screening?.score ? (
                                <Badge variant={getScoreBadgeVariant(screening.score)}>
                                  {screening.score}% match
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Not screened</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResumeScreening(item.candidate.id!, item.job.id!)}
                                  disabled={screening?.loading}
                                >
                                  {screening?.loading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-gray-600 mr-2"></div>
                                      Screening
                                    </>
                                  ) : (
                                    'Screen Resume'
                                  )}
                                </Button>
                                {screening?.score && screening.score >= 60 && (
                                  <Button size="sm" variant="default">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Schedule
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium mb-1">Add New Candidate</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Start the screening process with a new candidate
                </p>
                <Button size="sm" onClick={() => window.location.href = '/candidates'}>
                  Add Candidate
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium mb-1">Create Job Posting</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add a new position to match candidates against
                </p>
                <Button size="sm" onClick={() => window.location.href = '/jobs'}>
                  Create Job
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Analyze screening performance and hiring metrics
                </p>
                <Button size="sm" onClick={() => window.location.href = '/analytics'}>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="screener" className="space-y-6">
          <div className="space-y-6">
            {/* Public Form Link */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      📋 Share HR Screener Form Online
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                      Use this public link to allow candidates to submit applications directly and trigger the N8N workflow automatically.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-sm font-mono">
                      {window.location.origin}/hr-screener
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/hr-screener`)}
                    >
                      Copy Link
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => window.open('/hr-screener', '_blank')}
                    >
                      Open Form
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Internal Form */}
            <HRResumeScreenerForm 
              mode="internal"
              onComplete={(result) => {
                // Refresh data after successful workflow completion
                try {
                  if (candidates?.fetchCandidates) candidates.fetchCandidates();
                  if (applications?.fetchApplications) applications.fetchApplications();
                } catch (error) {
                  console.warn('Failed to refresh data:', error);
                }
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="scheduler" className="space-y-6">
          {/* Pass no hardcoded data - let user enter everything */}
          <InterviewScheduler standalone={true} />
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Preview how interview emails will appear to candidates
              </p>
            </div>
            <InterviewEmailPreview
              candidateName="John Doe"
              jobTitle="Software Engineer"
              interviewerName="Jane Smith"
              interviewDate="2024-02-15T14:00:00"
              questions={[
                {
                  id: "1",
                  question: "Tell me about your experience with React.",
                  category: "technical",
                  skills: ["React"]
                }
              ]}
              customMessage="We're excited to learn more about your experience and discuss how you might contribute to our team."
            />
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <FileText className="h-5 w-5" />
            Interview System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">✅ Automated Scheduling:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Google Calendar integration</li>
                <li>Automatic meeting link generation</li>
                <li>Email invitations to candidates and interviewers</li>
                <li>Customizable interview types (video, phone, in-person)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">🤖 AI-Powered Content:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Job-specific interview questions</li>
                <li>Technical coding challenges</li>
                <li>Skill-based exercise generation</li>
                <li>Behavioral and cultural fit questions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
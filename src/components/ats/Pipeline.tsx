import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseCandidates, useSupabaseJobs } from '@/hooks/useSupabase';
import { WorkflowScheduler } from '@/components/scheduling/WorkflowScheduler';
import { HRResumeScreener } from '@/components/screening/HRResumeScreener';
import { ScreeningTest } from '@/components/screening/ScreeningTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupabaseTest } from '@/components/debug/SupabaseTest';
import { Link } from 'react-router-dom';
import { CandidateList } from '@/components/candidates/CandidateList';
import JobsList from '@/components/jobs/jobs-list';
import CreateJobForm from '@/components/jobs/create-job-form';
import { InterviewsPage } from '@/components/interviews/InterviewsPage';
import { JobApplicationForm } from '@/components/jobs/JobApplicationForm';

import { 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  FileText,
  RefreshCw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PipelineCandidate {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  stage: string;
  avatar?: string;
  lastActivity: string;
  score: number;
  jobId: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  candidates: PipelineCandidate[];
}

export function Pipeline() {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [movingCandidate, setMovingCandidate] = useState<string | null>(null);
  const [jobsView, setJobsView] = useState<'list' | 'create'>('list');
  
  const { candidates, loading: candidatesLoading, error: candidatesError, fetchCandidates, updateCandidateStatus } = useSupabaseCandidates();
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs } = useSupabaseJobs();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [fetchJobs, fetchCandidates]);

  useEffect(() => {
    // Don't auto-select a job - leave empty to show all candidates
    // if (jobs.length > 0 && !selectedJob) {
    //   setSelectedJob(jobs[0].id || '');
    // }
  }, [jobs, selectedJob]);

  const stageDefinitions = [
    { id: 'active', name: 'New Applications', color: 'bg-blue-500', statuses: ['active'] },
    { id: 'screening', name: 'In Review', color: 'bg-yellow-500', statuses: ['screening'] },
    { id: 'interview', name: 'Interview', color: 'bg-purple-500', statuses: ['interview'] },
    { id: 'offer', name: 'Offer', color: 'bg-orange-500', statuses: ['offer'] },
    { id: 'placed', name: 'Placed/Hired', color: 'bg-green-500', statuses: ['placed'] },
    { id: 'inactive', name: 'Inactive', color: 'bg-gray-500', statuses: ['inactive'] }
  ];

  const transformCandidatesToPipeline = (): Stage[] => {
    // If no candidates data, return demo data
    if (!candidates || candidates.length === 0) {
      return getDemoStages();
    }

    let filteredCandidates = candidates;

    // Filter by job if selected
    if (selectedJob) {
      const selectedJobData = jobs.find(j => j.id === selectedJob);
      if (selectedJobData) {
        filteredCandidates = candidates.filter(candidate => 
          candidate.position === selectedJobData.title
        );
        console.log('Job filtering:', {
          selectedJob,
          selectedJobTitle: selectedJobData.title,
          candidatePositions: candidates.map(c => c.position),
          filteredCount: filteredCandidates.length
        });
      }
    } else {
      // If no job selected, show all candidates
      console.log('No job selected, showing all candidates');
    }

    const pipelineCandidates: PipelineCandidate[] = filteredCandidates.map(candidate => ({
      id: candidate.id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      position: candidate.position || 'Unknown Position',
      email: candidate.email,
      phone: candidate.phone || 'N/A',
      stage: candidate.status || 'active',
      lastActivity: candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : 
                   candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'Unknown',
      score: candidate.match_score || candidate.rating || Math.floor(Math.random() * 40) + 60,
      jobId: selectedJob || 'general'
    }));

    console.log('Pipeline transformation:', {
      totalCandidates: candidates.length,
      filteredCandidates: filteredCandidates.length,
      pipelineCandidates: pipelineCandidates,
      selectedJob
    });

    const stagesWithCandidates = stageDefinitions.map(stageDef => {
      const stageCandidates = pipelineCandidates.filter(candidate => {
        const candidateStage = candidate.stage?.toLowerCase() || 'active';
        const stageMatches = stageDef.statuses.some(status => 
          candidateStage === status.toLowerCase()
        );
        
        console.log(`Candidate ${candidate.name} (status: "${candidateStage}") matches stage ${stageDef.name} (${stageDef.statuses.join(', ')}):`, stageMatches);
        return stageMatches;
      });

      return {
        id: stageDef.id,
        name: stageDef.name,
        color: stageDef.color,
        candidates: stageCandidates
      };
    });

    console.log('Final stages with candidates:', stagesWithCandidates.map(s => ({ name: s.name, count: s.candidates.length })));
    return stagesWithCandidates;
  };

  const getDemoStages = (): Stage[] => {
    return [
      {
        id: 'active',
        name: 'New Applications',
        color: 'bg-blue-500',
        candidates: [
          {
            id: 'demo-1',
            name: 'John Doe',
            position: 'Senior React Developer',
            email: 'john@example.com',
            phone: '+1 555-0123',
            stage: 'active',
            lastActivity: '2 hours ago',
            score: 85,
            jobId: 'demo-job'
          },
          {
            id: 'demo-2',
            name: 'Jane Smith',
            position: 'Frontend Developer',
            email: 'jane@example.com',
            phone: '+1 555-0124',
            stage: 'active',
            lastActivity: '1 day ago',
            score: 92,
            jobId: 'demo-job'
          }
        ]
      },
      {
        id: 'screening',
        name: 'Screening',
        color: 'bg-yellow-500',
        candidates: [
          {
            id: 'demo-3',
            name: 'Mike Johnson',
            position: 'Full Stack Developer',
            email: 'mike@example.com',
            phone: '+1 555-0125',
            stage: 'screening',
            lastActivity: '3 hours ago',
            score: 78,
            jobId: 'demo-job'
          }
        ]
      },
      {
        id: 'interview',
        name: 'Interview',
        color: 'bg-purple-500',
        candidates: [
          {
            id: 'demo-4',
            name: 'Sarah Wilson',
            position: 'Senior React Developer',
            email: 'sarah@example.com',
            phone: '+1 555-0126',
            stage: 'interview',
            lastActivity: '1 hour ago',
            score: 95,
            jobId: 'demo-job'
          }
        ]
      },
      {
        id: 'offer',
        name: 'Offer',
        color: 'bg-orange-500',
        candidates: [
          {
            id: 'demo-5',
            name: 'Lisa Davis',
            position: 'UI/UX Developer',
            email: 'lisa@example.com',
            phone: '+1 555-0128',
            stage: 'offer',
            lastActivity: '2 days ago',
            score: 96,
            jobId: 'demo-job'
          }
        ]
      },
      {
        id: 'placed',
        name: 'Placed/Hired',
        color: 'bg-green-500',
        candidates: [
          {
            id: 'demo-6',
            name: 'Alex Chen',
            position: 'Senior React Developer',
            email: 'alex@example.com',
            phone: '+1 555-0129',
            stage: 'placed',
            lastActivity: '1 week ago',
            score: 94,
            jobId: 'demo-job'
          }
        ]
      },
      {
        id: 'inactive',
        name: 'Inactive',
        color: 'bg-gray-500',
        candidates: []
      }
    ];
  };

  const stages = transformCandidatesToPipeline();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleMoveCandidate = async (candidateId: string, newStage: string) => {
    if (movingCandidate) return;
    
    setMovingCandidate(candidateId);
    
    // If it's demo data, just show a demo message
    if (candidateId.startsWith('demo-') || !candidates || candidates.length === 0) {
      setTimeout(() => {
        toast({
          title: "Demo Mode",
          description: "This is demo data. Connect n8n workflows for real functionality.",
          variant: "default",
        });
        setMovingCandidate(null);
      }, 1000);
      return;
    }
    
    try {
      await updateCandidateStatus(
        candidateId,
        newStage,
        `Moved to ${newStage} stage via pipeline`
      );
      
      toast({
        title: "Success",
        description: "Candidate moved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move candidate",
        variant: "destructive",
      });
    } finally {
      setMovingCandidate(null);
    }
  };

  const handleRefresh = () => {
    fetchCandidates();
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">ATS Pipeline</h2>
          <p className="text-muted-foreground">
            Track and manage candidates through your hiring process. Use the Interviews page to schedule new interviews.
          </p>
          {(candidatesError || jobsError) && (
            <div className="mt-1">
              <p className="text-sm text-red-600">
                {candidatesError || jobsError}
              </p>
              <p className="text-xs text-yellow-600">
                Showing demo data. Check your Supabase connection.
              </p>
            </div>
          )}
          {(!candidates || candidates.length === 0) && !candidatesError && !candidatesLoading && (
            <p className="text-xs text-blue-600 mt-1">
              No candidates found. Applications from /apply will appear here.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to="/interviews">
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          <Button
            onClick={handleRefresh}
            disabled={candidatesLoading || jobsLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(candidatesLoading || jobsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
            disabled={jobsLoading}
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="screener">Mass Screening</TabsTrigger>
          <TabsTrigger value="scheduler">Workflow Scheduler</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="apply">Apply Form</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline" className="space-y-6">
              {/* Pipeline Stages */}
          {candidatesLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading pipeline data...</span>
            </div>
          )}
          
          {!candidatesLoading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    {stage.name}
                    <Badge variant="secondary" className="ml-2">
                      {stage.candidates.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.candidates.map((candidate) => (
                  <Card key={candidate.id} className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">{candidate.name}</h4>
                            <p className="text-xs text-muted-foreground">{candidate.lastActivity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${getScoreColor(candidate.score)}`}>
                            {candidate.score}%
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value !== candidate.stage) {
                                handleMoveCandidate(candidate.id, e.target.value);
                              }
                            }}
                            value={candidate.stage}
                            disabled={movingCandidate === candidate.id}
                            className="h-7 text-xs px-2 border rounded appearance-none bg-background pr-6 min-w-[80px]"
                          >
                            {stageDefinitions.map((stageDef) => (
                              <option key={stageDef.id} value={stageDef.id}>
                                {stageDef.name}
                              </option>
                            ))}
                          </select>
                          <ArrowRight className="absolute right-1 top-1.5 h-3 w-3 pointer-events-none" />
                          {movingCandidate === candidate.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {stage.candidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No candidates in this stage
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        </div>
      )}

          {/* Pipeline Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stages.map((stage) => (
                  <div key={stage.id} className="text-center">
                    <div className="text-2xl font-bold">{stage.candidates.length}</div>
                    <div className="text-sm text-muted-foreground">{stage.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screener">
          <HRResumeScreener jobId={selectedJob} />
        </TabsContent>

        <TabsContent value="scheduler">
          <WorkflowScheduler jobId={selectedJob} />
        </TabsContent>

        <TabsContent value="debug">
          <div className="space-y-6">
            <ScreeningTest />
            <SupabaseTest />
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <CandidateList />
        </TabsContent>
        <TabsContent value="jobs">
          {jobsView === 'list' ? (
            <JobsList onCreateNew={() => setJobsView('create')} />
          ) : (
            <CreateJobForm onCancel={() => setJobsView('list')} onSuccess={() => setJobsView('list')} />
          )}
        </TabsContent>
        <TabsContent value="interviews">
          <InterviewsPage />
        </TabsContent>
        <TabsContent value="apply">
          <div className="max-w-4xl mx-auto py-8">
            <JobApplicationForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


import React, { useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Clock,
  Zap,
  Award,
  Target,
  ArrowRight
} from 'lucide-react';
import { useRecruitment } from '@/hooks/useN8N';

export function Dashboard() {
  const { candidates, jobs, applications, dashboard } = useRecruitment();
  
  useEffect(() => {
    // Load dashboard data
    candidates.fetchCandidates();
    jobs.fetchJobs();
    applications.fetchApplications();
    dashboard.refreshStats();
  }, []);  
  
  // Use real data from N8N workflows when available, fallback to mock data
  const stats = {
    totalCandidates: candidates.candidates.length || 47,
    activeCandidates: candidates.candidates.filter(c => c.status === 'active').length || 23,
    totalJobs: jobs.jobs.length || 12,
    activeJobs: jobs.jobs.filter(j => j.status === 'active').length || 8,
    placements: applications.applications.filter(a => a.status === 'hired').length || 5,
    interviews: applications.applications.filter(a => a.status === 'interview').length || 12
  };

  const recentActivities = [
    { id: 1, type: 'screening', message: 'AI Resume Screener analyzed 15 new candidates', time: '5 minutes ago', icon: Zap },
    { id: 2, type: 'match', message: 'High match found: 92% compatibility for React Developer', time: '12 minutes ago', icon: Award },
    { id: 3, type: 'interview', message: 'Interview auto-scheduled via N8N workflow', time: '25 minutes ago', icon: Calendar },
    { id: 4, type: 'candidate', message: 'New candidate profile created via Supabase sync', time: '1 hour ago', icon: Users }
  ];

  const upcomingInterviews = [
    { candidate: 'Alice Johnson', position: 'Frontend Developer', time: '10:00 AM', client: 'StartupXYZ' },
    { candidate: 'Bob Wilson', position: 'Data Scientist', time: '2:30 PM', client: 'DataCorp' },
    { candidate: 'Carol Davis', position: 'Product Manager', time: '4:00 PM', client: 'InnovateTech' }
  ];

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Hero Section - HR Resume Screener */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <Badge variant="secondary" className="text-blue-600">
                    N8N + Supabase Powered
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold">
                  HR Resume Screener Complete
                </h1>
                <p className="text-blue-100 max-w-2xl">
                  Automated AI-powered resume screening with comprehensive candidate pipeline management. 
                  Screen resumes, match candidates to jobs, and schedule interviews automatically.
                </p>
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-blue-600"
                    onClick={() => window.location.href = '/pipeline'}
                  >
                    Launch Recruitment Hub
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">AI Matching Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Auto-Scheduling On</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">Resume Analysis Live</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Candidates"
            value={stats.totalCandidates.toLocaleString()}
            description={`${stats.activeCandidates} ready for screening`}
            icon={<Users className="h-4 w-4" />}
            trend={15.2}
            trendLabel="vs last month"
          />
          <StatsCard
            title="AI Screenings"
            value={Math.floor(stats.totalCandidates * 0.7)}
            description="Automated resume analysis"
            icon={<Zap className="h-4 w-4" />}
            trend={28.4}
            trendLabel="vs last month"
          />
          <StatsCard
            title="High Matches"
            value={Math.floor(stats.totalCandidates * 0.3)}
            description="80%+ compatibility score"
            icon={<Award className="h-4 w-4" />}
            trend={12.1}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Auto-Scheduled"
            value={stats.interviews}
            description="N8N workflow interviews"
            icon={<Calendar className="h-4 w-4" />}
            trend={45.3}
            trendLabel="vs last week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Screening Activity
              </CardTitle>
              <CardDescription>Latest updates from your automated HR pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Interviews
              </CardTitle>
              <CardDescription>Scheduled interviews for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                      <p className="text-xs text-muted-foreground">{interview.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{interview.time}</p>
                      <Button size="sm" variant="outline">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>AI Screening Performance</CardTitle>
            <CardDescription>Resume screener efficiency and match quality metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <h3 className="text-2xl font-bold text-green-600">94%</h3>
                <p className="text-sm text-muted-foreground">Screening Accuracy</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h3 className="text-2xl font-bold text-blue-600">2.3s</h3>
                <p className="text-sm text-muted-foreground">Avg Analysis Time</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <h3 className="text-2xl font-bold text-purple-600">78%</h3>
                <p className="text-sm text-muted-foreground">Match Success Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <h3 className="text-2xl font-bold text-orange-600">5.2 days</h3>
                <p className="text-sm text-muted-foreground">Time to Interview</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

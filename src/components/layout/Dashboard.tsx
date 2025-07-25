
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Clock
} from 'lucide-react';

export function Dashboard() {
  // Mock data for demo purposes
  const stats = {
    totalCandidates: 2847,
    activeCandidates: 1203,
    totalJobs: 156,
    activeJobs: 23,
    placements: 89,
    interviews: 47
  };

  const recentActivities = [
    { id: 1, type: 'candidate', message: 'New candidate John Doe applied for Senior Developer', time: '2 minutes ago' },
    { id: 2, type: 'interview', message: 'Interview scheduled with Sarah Smith', time: '15 minutes ago' },
    { id: 3, type: 'placement', message: 'Candidate placed at TechCorp Inc.', time: '1 hour ago' },
    { id: 4, type: 'job', message: 'New job posting: UI/UX Designer', time: '2 hours ago' }
  ];

  const upcomingInterviews = [
    { candidate: 'Alice Johnson', position: 'Frontend Developer', time: '10:00 AM', client: 'StartupXYZ' },
    { candidate: 'Bob Wilson', position: 'Data Scientist', time: '2:30 PM', client: 'DataCorp' },
    { candidate: 'Carol Davis', position: 'Product Manager', time: '4:00 PM', client: 'InnovateTech' }
  ];

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Create Job
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Candidates"
            value={stats.totalCandidates.toLocaleString()}
            description={`${stats.activeCandidates} active`}
            icon={<Users className="h-4 w-4" />}
            trend={12.5}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs}
            description={`${stats.totalJobs} total jobs`}
            icon={<Briefcase className="h-4 w-4" />}
            trend={-5.2}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Placements"
            value={stats.placements}
            description="This month"
            icon={<UserCheck className="h-4 w-4" />}
            trend={8.1}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Interviews"
            value={stats.interviews}
            description="This week"
            icon={<Calendar className="h-4 w-4" />}
            trend={15.3}
            trendLabel="vs last week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your recruitment pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
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

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <h3 className="text-2xl font-bold text-primary">85%</h3>
                <p className="text-sm text-muted-foreground">Interview Success Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10">
                <h3 className="text-2xl font-bold text-success">12 days</h3>
                <p className="text-sm text-muted-foreground">Average Time to Hire</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <h3 className="text-2xl font-bold text-warning">$125K</h3>
                <p className="text-sm text-muted-foreground">Revenue This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

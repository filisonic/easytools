
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/StatsCard';
import { 
  BarChart,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  DollarSign
} from 'lucide-react';

const Analytics = () => {
  const metrics = {
    totalCandidates: 2847,
    placementsThisMonth: 23,
    averageTimeToHire: 18,
    revenueThisMonth: 125000,
    activeJobs: 45,
    interviewsScheduled: 67
  };

  return (
    <PageLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track performance and gain insights into your recruitment process</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Candidates"
            value={metrics.totalCandidates.toLocaleString()}
            description="In database"
            icon={<Users className="h-4 w-4" />}
            trend={12.5}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Placements"
            value={metrics.placementsThisMonth}
            description="This month"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={8.1}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Avg. Time to Hire"
            value={`${metrics.averageTimeToHire} days`}
            description="Current average"
            icon={<Calendar className="h-4 w-4" />}
            trend={-5.2}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Revenue"
            value={`$${(metrics.revenueThisMonth / 1000).toFixed(0)}K`}
            description="This month"
            icon={<DollarSign className="h-4 w-4" />}
            trend={15.3}
            trendLabel="vs last month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placement Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Placement Trends
              </CardTitle>
              <CardDescription>Monthly placement performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Chart visualization would be displayed here</p>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pipeline Conversion
              </CardTitle>
              <CardDescription>Conversion rates through hiring stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Funnel chart would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sources</CardTitle>
              <CardDescription>Where your best candidates come from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">LinkedIn</span>
                <span className="text-sm font-medium">34%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Indeed</span>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Referrals</span>
                <span className="text-sm font-medium">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Company Website</span>
                <span className="text-sm font-medium">16%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Performance</CardTitle>
              <CardDescription>Top clients by placements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">TechCorp Inc.</span>
                <span className="text-sm font-medium">8 placements</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">StartupXYZ</span>
                <span className="text-sm font-medium">6 placements</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CloudTech Solutions</span>
                <span className="text-sm font-medium">4 placements</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">InnovateTech</span>
                <span className="text-sm font-medium">3 placements</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recruiter Performance</CardTitle>
              <CardDescription>Individual recruiter metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sarah Johnson</span>
                <span className="text-sm font-medium">95% success rate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mike Davis</span>
                <span className="text-sm font-medium">88% success rate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lisa Chen</span>
                <span className="text-sm font-medium">92% success rate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tom Wilson</span>
                <span className="text-sm font-medium">85% success rate</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;


import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';

const Reports = () => {
  const reports = [
    {
      id: '1',
      name: 'Report Name',
      description: 'Report description goes here.',
      lastGenerated: '2024-01-01',
      type: 'generic'
    }
  ];

  const quickStats = [
    { title: 'Total Reports Generated', value: '0', icon: FileText },
    { title: 'This Month', value: '0', icon: Calendar },
    { title: 'Average Time to Generate', value: '0s', icon: TrendingUp }
  ];

  return (
    <PageLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Reports</h2>
            <p className="text-muted-foreground">Generate and manage recruitment reports</p>
          </div>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Create Custom Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Pre-built report templates for common use cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm">
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Custom Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
            <CardDescription>Create custom reports with specific metrics and filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-medium">Candidate Report</h4>
                  <p className="text-sm text-muted-foreground">Custom candidate analytics</p>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="text-center space-y-2">
                  <Briefcase className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-medium">Job Report</h4>
                  <p className="text-sm text-muted-foreground">Job performance metrics</p>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-medium">Performance Report</h4>
                  <p className="text-sm text-muted-foreground">Overall performance analysis</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  FileText
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  stage: string;
  avatar?: string;
  lastActivity: string;
  score: number;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  candidates: Candidate[];
}

export function Pipeline() {
  const [selectedJob, setSelectedJob] = useState('senior-react-developer');

  // Mock data for pipeline stages
  const stages: Stage[] = [
    {
      id: 'applied',
      name: 'Applied',
      color: 'bg-blue-500',
      candidates: [
        {
          id: '1',
          name: 'John Doe',
          position: 'Senior React Developer',
          email: 'john@example.com',
          phone: '+1 555-0123',
          stage: 'applied',
          lastActivity: '2 hours ago',
          score: 85
        },
        {
          id: '2',
          name: 'Jane Smith',
          position: 'Senior React Developer',
          email: 'jane@example.com',
          phone: '+1 555-0124',
          stage: 'applied',
          lastActivity: '1 day ago',
          score: 92
        }
      ]
    },
    {
      id: 'screening',
      name: 'Screening',
      color: 'bg-yellow-500',
      candidates: [
        {
          id: '3',
          name: 'Mike Johnson',
          position: 'Senior React Developer',
          email: 'mike@example.com',
          phone: '+1 555-0125',
          stage: 'screening',
          lastActivity: '3 hours ago',
          score: 78
        }
      ]
    },
    {
      id: 'interview',
      name: 'Interview',
      color: 'bg-purple-500',
      candidates: [
        {
          id: '4',
          name: 'Sarah Wilson',
          position: 'Senior React Developer',
          email: 'sarah@example.com',
          phone: '+1 555-0126',
          stage: 'interview',
          lastActivity: '1 hour ago',
          score: 95
        },
        {
          id: '5',
          name: 'Tom Brown',
          position: 'Senior React Developer',
          email: 'tom@example.com',
          phone: '+1 555-0127',
          stage: 'interview',
          lastActivity: '5 hours ago',
          score: 88
        }
      ]
    },
    {
      id: 'offer',
      name: 'Offer',
      color: 'bg-orange-500',
      candidates: [
        {
          id: '6',
          name: 'Lisa Davis',
          position: 'Senior React Developer',
          email: 'lisa@example.com',
          phone: '+1 555-0128',
          stage: 'offer',
          lastActivity: '2 days ago',
          score: 96
        }
      ]
    },
    {
      id: 'hired',
      name: 'Hired',
      color: 'bg-green-500',
      candidates: [
        {
          id: '7',
          name: 'Alex Chen',
          position: 'Senior React Developer',
          email: 'alex@example.com',
          phone: '+1 555-0129',
          stage: 'hired',
          lastActivity: '1 week ago',
          score: 94
        }
      ]
    }
  ];

  const jobs = [
    { id: 'senior-react-developer', title: 'Senior React Developer' },
    { id: 'ux-designer', title: 'UX Designer' },
    { id: 'devops-engineer', title: 'DevOps Engineer' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">ATS Pipeline</h2>
          <p className="text-muted-foreground">Track candidates through your hiring process</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Pipeline Stages */}
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
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                          Move
                        </Button>
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
    </div>
  );
}

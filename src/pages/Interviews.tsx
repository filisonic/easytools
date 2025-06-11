
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Plus
} from 'lucide-react';

const Interviews = () => {
  const interviews = [
    {
      id: '1',
      candidate: 'Alice Johnson',
      position: 'Frontend Developer',
      client: 'TechCorp Inc.',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'video',
      status: 'scheduled',
      interviewer: 'Sarah Smith'
    },
    {
      id: '2',
      candidate: 'Bob Wilson',
      position: 'Data Scientist',
      client: 'StartupXYZ',
      date: '2024-01-20',
      time: '2:30 PM',
      type: 'phone',
      status: 'scheduled',
      interviewer: 'Mike Davis'
    },
    {
      id: '3',
      candidate: 'Carol Davis',
      position: 'Product Manager',
      client: 'CloudTech Solutions',
      date: '2024-01-21',
      time: '4:00 PM',
      type: 'in-person',
      status: 'confirmed',
      interviewer: 'Lisa Johnson'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout title="Interviews">
      <div className="space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Interviews</h2>
            <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>

        {/* Today's Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Interviews
            </CardTitle>
            <CardDescription>Scheduled for January 20, 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviews.filter(interview => interview.date === '2024-01-20').map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(interview.type)}
                    <div>
                      <h4 className="font-medium">{interview.candidate}</h4>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                      <p className="text-xs text-muted-foreground">{interview.client}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {interview.time}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {interview.interviewer}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                  <Button size="sm">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>All scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(interview.type)}
                    <div>
                      <h4 className="font-medium">{interview.candidate}</h4>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                      <p className="text-xs text-muted-foreground">{interview.client}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>{new Date(interview.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {interview.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {interview.interviewer}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Interviews;

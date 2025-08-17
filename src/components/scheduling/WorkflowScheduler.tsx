import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Play, 
  Pause, 
  Calendar,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';

interface ScheduledWorkflow {
  id: string;
  name: string;
  type: 'email_reminder' | 'status_update' | 'data_sync' | 'ai_screening';
  schedule: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  description: string;
}

interface WorkflowSchedulerProps {
  jobId?: string;
  candidateId?: string;
}

export function WorkflowScheduler({ jobId, candidateId }: WorkflowSchedulerProps) {
  const [workflows, setWorkflows] = useState<ScheduledWorkflow[]>([
    {
      id: '1',
      name: 'Daily Application Sync',
      type: 'data_sync',
      schedule: '0 9 * * *',
      isActive: true,
      lastRun: '2024-01-15 09:00:00',
      nextRun: '2024-01-16 09:00:00',
      description: 'Synchronize new applications from external sources'
    },
    {
      id: '2',
      name: 'Weekly Status Reminder',
      type: 'email_reminder',
      schedule: '0 10 * * 1',
      isActive: true,
      lastRun: '2024-01-08 10:00:00',
      nextRun: '2024-01-15 10:00:00',
      description: 'Send status update reminders to hiring managers'
    },
    {
      id: '3',
      name: 'AI Resume Screening',
      type: 'ai_screening',
      schedule: '0 */2 * * *',
      isActive: false,
      lastRun: '2024-01-15 08:00:00',
      nextRun: '2024-01-15 10:00:00',
      description: 'Automatically screen new resumes using AI'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    type: 'email_reminder' as const,
    schedule: '',
    description: ''
  });

  const { toast } = useToast();

  const workflowTypes = [
    { value: 'email_reminder', label: 'Email Reminder', icon: '📧' },
    { value: 'status_update', label: 'Status Update', icon: '🔄' },
    { value: 'data_sync', label: 'Data Sync', icon: '🔗' },
    { value: 'ai_screening', label: 'AI Screening', icon: '🤖' }
  ];

  const toggleWorkflow = async (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      )
    );

    toast({
      title: "Workflow Updated",
      description: "Workflow status changed successfully",
    });
  };

  const deleteWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
    
    toast({
      title: "Workflow Deleted",
      description: "Workflow removed successfully",
    });
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.schedule) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const workflow: ScheduledWorkflow = {
      id: Date.now().toString(),
      ...newWorkflow,
      isActive: true,
      nextRun: 'Calculating...'
    };

    setWorkflows(prev => [...prev, workflow]);
    setNewWorkflow({
      name: '',
      type: 'email_reminder',
      schedule: '',
      description: ''
    });
    setShowCreateForm(false);

    toast({
      title: "Workflow Created",
      description: "New workflow scheduled successfully",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getTypeIcon = (type: string) => {
    const typeData = workflowTypes.find(t => t.value === type);
    return typeData?.icon || '⚙️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Scheduler</h3>
          <p className="text-sm text-muted-foreground">
            Automate your ATS processes with n8n workflows
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Workflow
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflow-type">Type</Label>
                <Select
                  value={newWorkflow.type}
                  onValueChange={(value: any) => setNewWorkflow(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="workflow-schedule">Schedule (Cron Expression)</Label>
              <Input
                id="workflow-schedule"
                value={newWorkflow.schedule}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, schedule: e.target.value }))}
                placeholder="0 9 * * * (daily at 9 AM)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: "0 9 * * *" (daily 9 AM), "0 10 * * 1" (weekly Monday 10 AM)
              </p>
            </div>

            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createWorkflow}>Create Workflow</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getTypeIcon(workflow.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{workflow.name}</h4>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(workflow.isActive)} text-white`}
                      >
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {workflow.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Schedule: {workflow.schedule}
                      </div>
                      {workflow.lastRun && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last: {workflow.lastRun}
                        </div>
                      )}
                      {workflow.nextRun && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {workflow.nextRun}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleWorkflow(workflow.id)}
                    className="h-8 w-8 p-0"
                  >
                    {workflow.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No Workflows Scheduled</h4>
            <p className="text-muted-foreground mb-4">
              Create your first automated workflow to streamline your ATS process
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Your First Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
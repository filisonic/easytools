import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { candidatesAPI } from '@/api/candidates';
import { RecruitmentCandidate } from '@/types/recruitment';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Star,
  Brain,
  MessageSquare,
  Filter,
  RefreshCw,
  ArrowRight,
  User,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

export default function AdminRecruitmentPipeline() {
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<RecruitmentCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, statusFilter, positionFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesResult, statsResult] = await Promise.all([
        candidatesAPI.getAll(),
        candidatesAPI.getStats(),
      ]);
      
      if (candidatesResult.error) {
        throw new Error(candidatesResult.error);
      }
      if (statsResult.error) {
        throw new Error(statsResult.error);
      }
      
      setCandidates(candidatesResult.data);
      setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load pipeline data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (positionFilter !== 'all') {
      filtered = filtered.filter(c => c.position === positionFilter);
    }

    setFilteredCandidates(filtered);
  };

  const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const result = await candidatesAPI.update(candidateId, { 
        status: newStatus as any,
        updated_at: new Date().toISOString(),
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setCandidates(prev => prev.map(c => c.id === candidateId ? result.data! : c));
      toast({
        title: "Success",
        description: "Candidate status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update candidate status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      invited: { variant: "outline", icon: <Mail className="h-3 w-3" /> },
      applied: { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
      ai_analyzed: { variant: "default", icon: <Brain className="h-3 w-3" /> },
      screening: { variant: "default", icon: <MessageSquare className="h-3 w-3" /> },
      interview_scheduled: { variant: "default", icon: <Calendar className="h-3 w-3" /> },
      hired: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || { variant: "outline" as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getMatchScoreBadge = (score?: number) => {
    if (!score) return <span className="text-muted-foreground">-</span>;
    
    let variant: "default" | "secondary" | "outline" = "outline";
    let color = "text-muted-foreground";
    
    if (score >= 80) {
      variant = "default";
      color = "text-green-600";
    } else if (score >= 60) {
      variant = "secondary";
      color = "text-yellow-600";
    }

    return (
      <Badge variant={variant} className={color}>
        <Star className="h-3 w-3 mr-1" />
        {score}%
      </Badge>
    );
  };

  const uniquePositions = [...new Set(candidates.map(c => c.position))];

  const pipelineStages = [
    { key: 'invited', label: 'Invited', count: stats?.invited || 0 },
    { key: 'applied', label: 'Applied', count: stats?.applied || 0 },
    { key: 'ai_analyzed', label: 'AI Analyzed', count: stats?.ai_analyzed || 0 },
    { key: 'screening', label: 'Screening', count: stats?.screening || 0 },
    { key: 'interview_scheduled', label: 'Interview', count: stats?.interview_scheduled || 0 },
    { key: 'hired', label: 'Hired', count: stats?.hired || 0 },
  ];

  return (
    <PageLayout title="Recruitment Pipeline">
      <div className="space-y-6">
        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pipeline Overview
            </CardTitle>
            <CardDescription>Track candidates through each stage of the recruitment process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {pipelineStages.map((stage, index) => (
                <div key={stage.key} className="relative">
                  <Card className={`p-4 text-center cursor-pointer transition-colors ${
                    statusFilter === stage.key ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`} onClick={() => setStatusFilter(stage.key)}>
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <div className="text-sm text-muted-foreground">{stage.label}</div>
                  </Card>
                  {index < pipelineStages.length - 1 && (
                    <ArrowRight className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hidden lg:block" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Candidates</span>
                </div>
                <div className="text-2xl font-bold">{stats.total_candidates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">High Match (80%+)</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.high_match}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <div className="text-2xl font-bold">{stats.applied + stats.ai_analyzed + stats.screening}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Hired</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Candidate Pipeline</CardTitle>
                <CardDescription>Manage candidates through the recruitment process</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="ai_analyzed">AI Analyzed</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {uniquePositions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{candidate.first_name} {candidate.last_name}</div>
                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {candidate.position}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                      <TableCell>{getMatchScoreBadge(candidate.match_score)}</TableCell>
                      <TableCell>
                        {candidate.applied_at ? (
                          new Date(candidate.applied_at).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Not applied</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {candidate.first_name} {candidate.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                  Candidate details and AI analysis
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Contact Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {candidate.email}
                                      </div>
                                      {candidate.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4" />
                                          {candidate.phone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Application Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>Position: <strong>{candidate.position}</strong></div>
                                      <div>Status: {getStatusBadge(candidate.status)}</div>
                                      <div>Match Score: {getMatchScoreBadge(candidate.match_score)}</div>
                                    </div>
                                  </div>
                                </div>

                                {candidate.skills && (
                                  <div>
                                    <h4 className="font-medium mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {(Array.isArray(candidate.skills) ? candidate.skills : candidate.skills.split(',')).map((skill, index) => (
                                        <Badge key={index} variant="outline">{skill.trim()}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {candidate.experience && (
                                  <div>
                                    <h4 className="font-medium mb-2">Experience</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {candidate.experience}
                                    </p>
                                  </div>
                                )}

                                {candidate.ai_analysis && (
                                  <div>
                                    <h4 className="font-medium mb-2">AI Analysis</h4>
                                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                      <pre className="whitespace-pre-wrap font-mono text-xs">
                                        {JSON.stringify(candidate.ai_analysis, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                  <Select 
                                    value={candidate.status} 
                                    onValueChange={(newStatus) => updateCandidateStatus(candidate.id!, newStatus)}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="invited">Invited</SelectItem>
                                      <SelectItem value="applied">Applied</SelectItem>
                                      <SelectItem value="ai_analyzed">AI Analyzed</SelectItem>
                                      <SelectItem value="screening">Screening</SelectItem>
                                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                      <SelectItem value="hired">Hired</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Select 
                            value={candidate.status} 
                            onValueChange={(newStatus) => updateCandidateStatus(candidate.id!, newStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="invited">Invited</SelectItem>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="ai_analyzed">AI Analyzed</SelectItem>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
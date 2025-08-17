import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { candidatesAPI } from '@/api/candidates';
import { emailAPI } from '@/api/email';
import { RecruitmentCandidate, BulkCandidateImport, EmailTemplate } from '@/types/recruitment';
import { 
  Upload, 
  Send, 
  Users, 
  Mail, 
  FileText, 
  Plus, 
  Download,
  Copy,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  ExternalLink
} from 'lucide-react';

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<BulkCandidateImport[]>([]);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // CSV parsing function
  const parseCsvFile = (file: File): Promise<BulkCandidateImport[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const candidates: BulkCandidateImport[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 4) {
              const candidate: BulkCandidateImport = {
                first_name: values[headers.indexOf('first_name') || headers.indexOf('firstname') || 0] || '',
                last_name: values[headers.indexOf('last_name') || headers.indexOf('lastname') || 1] || '',
                email: values[headers.indexOf('email') || 2] || '',
                position: values[headers.indexOf('position') || headers.indexOf('role') || 3] || '',
              };
              
              if (candidate.email && candidate.first_name && candidate.last_name) {
                candidates.push(candidate);
              }
            }
          }
          
          resolve(candidates);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
  });

  // Email template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'invitation' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesResult, templatesResult, statsResult] = await Promise.all([
        candidatesAPI.getAll(),
        emailAPI.getTemplates(),
        candidatesAPI.getStats(),
      ]);
      
      if (candidatesResult.error) {
        throw new Error(candidatesResult.error);
      }
      if (templatesResult.error) {
        throw new Error(templatesResult.error);
      }
      if (statsResult.error) {
        throw new Error(statsResult.error);
      }
      
      setCandidates(candidatesResult.data);
      setEmailTemplates(templatesResult.data);
      setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCsvFile(file);
      const preview = await parseCsvFile(file);
      setCsvPreview(preview);
      setShowCsvDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    if (!csvPreview.length) return;

    setLoading(true);
    try {
      const result = await candidatesAPI.bulkCreate(csvPreview, 'current-user'); // TODO: Get actual user ID
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setCandidates(prev => [...result.data, ...prev]);
      setShowCsvDialog(false);
      setCsvFile(null);
      setCsvPreview([]);
      
      toast({
        title: "Success",
        description: `Imported ${result.data.length} candidates successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.first_name || !newCandidate.last_name || !newCandidate.email || !newCandidate.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await candidatesAPI.create({
        ...newCandidate,
        status: 'invited',
        invited_by: 'current-user', // TODO: Get actual user ID
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setCandidates(prev => [result.data!, ...prev]);
      setShowAddCandidateDialog(false);
      setNewCandidate({ first_name: '', last_name: '', email: '', position: '' });
      
      toast({
        title: "Success",
        description: "Candidate added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add candidate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async (templateId: string) => {
    if (!selectedCandidates.length) {
      toast({
        title: "Error",
        description: "Please select candidates to email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await emailAPI.sendBulkEmails(selectedCandidates, templateId, 'current-user');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setShowEmailDialog(false);
      setSelectedCandidates([]);
      
      toast({
        title: "Success",
        description: `Emails sent to ${selectedCandidates.length} candidates`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApplicationLink = (token: string) => {
    const link = `${window.location.origin}/apply/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied",
      description: "Application link copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      invited: "outline",
      applied: "secondary",
      ai_analyzed: "default",
      screening: "default",
      interview_scheduled: "default",
      hired: "default",
      rejected: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <PageLayout title="Recruiter Dashboard">
      <div className="space-y-6">
        {/* Stats Overview */}
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
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Applied</span>
                </div>
                <div className="text-2xl font-bold">{stats.applied}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">High Match</span>
                </div>
                <div className="text-2xl font-bold">{stats.high_match}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Interview Ready</span>
                </div>
                <div className="text-2xl font-bold">{stats.interview_scheduled}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="candidates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Candidate Management</CardTitle>
                    <CardDescription>
                      Upload candidates via CSV or add manually, then send invitation emails
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </label>
                    </Button>
                    
                    <Dialog open={showAddCandidateDialog} onOpenChange={setShowAddCandidateDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Candidate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Candidate</DialogTitle>
                          <DialogDescription>
                            Add a candidate manually to generate their application link
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={newCandidate.first_name}
                                onChange={(e) => setNewCandidate(prev => ({ ...prev, first_name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={newCandidate.last_name}
                                onChange={(e) => setNewCandidate(prev => ({ ...prev, last_name: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newCandidate.email}
                              onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="position">Position</Label>
                            <Input
                              id="position"
                              value={newCandidate.position}
                              onChange={(e) => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddCandidate} disabled={loading}>
                              Add Candidate
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddCandidateDialog(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {selectedCandidates.length > 0 && (
                      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Send className="h-4 w-4 mr-2" />
                            Send Emails ({selectedCandidates.length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Bulk Emails</DialogTitle>
                            <DialogDescription>
                              Select an email template to send to {selectedCandidates.length} selected candidates
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {emailTemplates.filter(t => t.type === 'invitation').map(template => (
                              <Card key={template.id} className="cursor-pointer hover:bg-muted/50" 
                                    onClick={() => handleSendEmails(template.id!)}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{template.name}</h4>
                                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                                    </div>
                                    <Send className="h-4 w-4" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCandidates(candidates.map(c => c.id!));
                              } else {
                                setSelectedCandidates([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(candidate.id!)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCandidates(prev => [...prev, candidate.id!]);
                                } else {
                                  setSelectedCandidates(prev => prev.filter(id => id !== candidate.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {candidate.first_name} {candidate.last_name}
                            </div>
                          </TableCell>
                          <TableCell>{candidate.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              {candidate.position}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            {candidate.match_score ? (
                              <Badge variant={candidate.match_score >= 80 ? "default" : candidate.match_score >= 60 ? "secondary" : "outline"}>
                                {candidate.match_score}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyApplicationLink(candidate.token)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/apply/${candidate.token}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Manage email templates for candidate invitations and follow-ups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                            <Badge variant="outline" className="mt-2">{template.type}</Badge>
                          </div>
                          <Button variant="outline">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CSV Import Dialog */}
        <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>CSV Import Preview</DialogTitle>
              <DialogDescription>
                Review the candidates that will be imported from your CSV file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((candidate, index) => (
                      <TableRow key={index}>
                        <TableCell>{candidate.first_name}</TableCell>
                        <TableCell>{candidate.last_name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBulkImport} disabled={loading}>
                  Import {csvPreview.length} Candidates
                </Button>
                <Button variant="outline" onClick={() => setShowCsvDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
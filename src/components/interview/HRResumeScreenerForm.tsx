import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Database,
  Globe
} from 'lucide-react';
import n8nService from '@/services/n8nService';
import { useJobs } from '@/hooks/useN8N';

interface HRResumeScreenerFormProps {
  mode?: 'internal' | 'public';
  onComplete?: (result: any) => void;
}

export function HRResumeScreenerForm({ mode = 'internal', onComplete }: HRResumeScreenerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: [] as string[],
    cover_letter: '',
    job_id: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const { jobs, fetchJobs } = useJobs();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setResumeFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.position) {
        throw new Error('Please fill in all required fields');
      }

      // Convert resume file to base64 if provided
      let resumeData = null;
      if (resumeFile) {
        resumeData = await convertFileToBase64(resumeFile);
      }

      const submissionData = {
        ...formData,
        resume_file: resumeData
      };

      let response;
      if (mode === 'public') {
        // Use public endpoint for online form
        response = await n8nService.submitPublicHRScreening(submissionData);
      } else {
        // 🎯 Use the exact "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow
        response = await n8nService.triggerHRResumeScreenerSupabaseComplete(submissionData);
      }

      if (response.success) {
        setResult(response);
        toast({
          title: "🎉 Workflow Started!",
          description: mode === 'public' 
            ? "Your application has been submitted successfully!" 
            : "HR Resume Screener workflow has been triggered successfully!",
        });

        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          skills: [],
          cover_letter: '',
          job_id: ''
        });
        setResumeFile(null);
        
        onComplete?.(response);
      } else {
        throw new Error(response.error || 'Workflow failed to start');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to start workflow",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'public' ? <Globe className="h-5 w-5" /> : <Database className="h-5 w-5" />}
            <div className="flex flex-col">
              <span>HR Resume Screener - Supabase Complete</span>
              <span className="text-sm font-normal text-muted-foreground">(Binary Fixed Final)</span>
            </div>
            <Badge variant="outline" className="ml-2">
              {mode === 'public' ? 'Public Form' : 'N8N Workflow'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {mode === 'public' 
              ? 'Submit your application and automatically trigger the "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow'
              : '🎯 This form triggers the exact N8N workflow: "HR Resume Screener - Supabase Complete (Binary Fixed Final)" with Supabase integration and binary file processing'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position Applied For *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="e.g., Senior React Developer"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_id">Match Against Job (Optional)</Label>
                <Select value={formData.job_id} onValueChange={(value) => handleInputChange('job_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job to match against" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id!}>
                        {job.title} - {job.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 5 years"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">Resume Upload</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload your resume (PDF or Word document)
                    </p>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('resume')?.click()}
                    >
                      Choose File
                    </Button>
                    {resumeFile && (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {resumeFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover Letter</Label>
              <Textarea
                id="cover_letter"
                value={formData.cover_letter}
                onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                placeholder="Tell us why you're interested in this position..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white mr-2"></div>
                  {mode === 'public' ? 'Submitting Application...' : 'Starting Workflow...'}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {mode === 'public' ? 'Submit Application' : 'Start "HR Resume Screener - Supabase Complete (Binary Fixed Final)" Workflow'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              "HR Resume Screener - Supabase Complete (Binary Fixed Final)" Workflow Started!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Workflow:</strong> HR Resume Screener - Supabase Complete (Binary Fixed Final)</p>
              <p><strong>Candidate ID:</strong> {result.candidate_id}</p>
              <p><strong>Status:</strong> {result.message}</p>
              {result.endpoint_used && (
                <p><strong>Webhook Endpoint Used:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{result.endpoint_used}</code></p>
              )}
              {result.screening_result && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Screening Result:</h4>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(result.screening_result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info for Internal Mode */}
      {mode === 'internal' && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Database className="h-5 w-5" />
              Workflow Connection Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-2">🎯 Target Workflow:</p>
                <code className="bg-white dark:bg-gray-800 p-2 rounded block">
                  "HR Resume Screener - Supabase Complete (Binary Fixed Final)"
                </code>
              </div>
              <div>
                <p className="font-medium mb-2">🔗 Webhook Endpoints (will try in order):</p>
                <ul className="space-y-1 text-xs">
                  <li>• <code>/hr-resume-screener-supabase-complete-binary-fixed-final</code></li>
                  <li>• <code>/hr-resume-screener-complete</code></li>
                  <li>• <code>/hr-screener-supabase-complete</code></li>
                  <li>• <code>/resume-screener-binary-fixed</code></li>
                  <li>• <code>/easyhrtools-resume-screener</code></li>
                </ul>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded">
                <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                  💡 <strong>Setup Tip:</strong> Make sure your N8N workflow "HR Resume Screener - Supabase Complete (Binary Fixed Final)" 
                  has a webhook trigger with one of the above paths active.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
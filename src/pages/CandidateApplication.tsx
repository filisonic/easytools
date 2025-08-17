import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { candidatesAPI } from '@/api/candidates';
import { RecruitmentCandidate } from '@/types/recruitment';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function CandidateApplication() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [candidate, setCandidate] = useState<RecruitmentCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    experience: '',
    skills: '',
    resume_file: null as File | null,
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid application link');
      setLoading(false);
      return;
    }

    loadCandidate();
  }, [token]);

  const loadCandidate = async () => {
    try {
      const result = await candidatesAPI.getByToken(token!);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (!result.data) {
        setError('Application not found or has expired');
        return;
      }

      if (result.data.status === 'applied') {
        setSubmitted(true);
      }

      setCandidate(result.data);
      
      // Pre-fill form if candidate has already applied
      if (result.data.phone) setFormData(prev => ({ ...prev, phone: result.data.phone || '' }));
      if (result.data.experience) setFormData(prev => ({ ...prev, experience: result.data.experience || '' }));
      if (result.data.skills) setFormData(prev => ({ ...prev, skills: Array.isArray(result.data.skills) ? result.data.skills.join(', ') : result.data.skills || '' }));

    } catch (err) {
      console.error('Error loading candidate:', err);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll simulate the upload
      return `https://example.com/resumes/${file.name}`;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate) return;

    // Basic validation
    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.experience.trim()) {
      toast({
        title: "Validation Error", 
        description: "Experience details are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let resume_url = candidate.resume_url;
      
      // Upload resume if a new file was selected
      if (formData.resume_file) {
        resume_url = await handleFileUpload(formData.resume_file);
      }

      // Parse skills into array
      const skills = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      // Submit application
      const result = await candidatesAPI.submitApplication(token!, {
        phone: formData.phone.trim(),
        experience: formData.experience.trim(),
        skills: skills.length > 0 ? skills : undefined,
        resume_url,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setSubmitted(true);
      toast({
        title: "Success",
        description: "Application submitted successfully! You will hear from us soon.",
      });

      // Reload candidate data to show updated status
      await loadCandidate();

    } catch (err) {
      console.error('Submission error:', err);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, resume_file: file }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading application...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && candidate?.status === 'applied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your application, {candidate.first_name}! Our HR team will review your profile and get back to you soon.
            </p>
            <Badge variant="default" className="mb-4">
              Application Status: {candidate.status.replace('_', ' ')}
            </Badge>
            <div className="text-sm text-muted-foreground">
              <p>Position: <strong>{candidate.position}</strong></p>
              <p>Submitted: {new Date(candidate.applied_at!).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Job Application</CardTitle>
            <CardDescription className="text-blue-100">
              Complete your application for the {candidate?.position} position
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {candidate && (
              <div className="space-y-6">
                {/* Candidate Info Display */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{candidate.first_name} {candidate.last_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{candidate.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Position:</span>
                      <p className="font-medium">{candidate.position}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{candidate.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience & Background *
                    </Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Tell us about your relevant experience, previous roles, and achievements..."
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Skills & Technologies
                    </Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="e.g., React, TypeScript, Node.js, Python..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="resume" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Resume/CV {!candidate.resume_url && '*'}
                    </Label>
                    <div className="mt-2">
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('resume')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.resume_file ? formData.resume_file.name : 
                         candidate.resume_url ? 'Replace Resume' : 'Upload Resume'}
                      </Button>
                      {candidate.resume_url && !formData.resume_file && (
                        <p className="text-xs text-muted-foreground mt-1">
                          You have already uploaded a resume. Upload a new file to replace it.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground border-t pt-4">
                  <p>
                    By submitting this application, you agree to our privacy policy and terms of service.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
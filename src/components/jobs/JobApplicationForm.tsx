import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useCandidates } from '../../hooks/useN8N';
import { useSupabaseCandidates } from '../../hooks/useSupabase';
import { Candidate } from '../../types/n8n';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { getAnonymousUserId } from '../../utils/uuid';

const applicationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  experience: z.string().optional(),
  skills: z.string().optional(),
  cover_letter: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationFormProps {
  jobTitle?: string;
  jobId?: string;
}

export const JobApplicationForm = ({ jobTitle = "Software Developer", jobId }: JobApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitApplication } = useCandidates();
  const { createCandidate } = useSupabaseCandidates();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema)
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      // Get current user or generate a proper anonymous UUID
      const { data: { user } } = await supabase.auth.getUser();
      const createdBy = user?.id || getAnonymousUserId();

      // Save to Supabase first  
      const supabaseCandidate = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        status: 'active', // Use 'active' instead of 'applied' to match DB constraint  
        created_by: createdBy,
        position: data.position || jobTitle
      };

      console.log('Submitting candidate to Supabase:', supabaseCandidate);
      const savedCandidate = await createCandidate(supabaseCandidate);
      console.log('Candidate saved to Supabase:', savedCandidate);

      // Also try to submit to n8n workflows if available
      try {
        const n8nCandidate: Candidate = {
          ...data,
          skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
          applied_at: new Date().toISOString(),
          status: 'active'
        };
        await submitApplication(n8nCandidate);
      } catch (n8nError) {
        console.log('n8n submission failed, but Supabase save succeeded:', n8nError);
      }

      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll be in touch soon.",
      });
      
      reset();
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
            />
          </div>

          <div>
            <Label htmlFor="position">Position Applying For *</Label>
            <Input
              id="position"
              {...register('position')}
              defaultValue={jobTitle}
              className={errors.position ? 'border-red-500' : ''}
            />
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              {...register('experience')}
              placeholder="e.g., 3 years"
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              {...register('skills')}
              placeholder="e.g., React, TypeScript, Node.js"
            />
          </div>

          <div>
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              {...register('cover_letter')}
              rows={4}
              placeholder="Tell us why you're interested in this position..."
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

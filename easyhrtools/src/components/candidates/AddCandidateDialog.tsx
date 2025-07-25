
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCandidateAdded: () => void;
}

interface CandidateForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  skills: string;
  status: 'active' | 'placed' | 'inactive';
  rating: number;
}

export function AddCandidateDialog({ open, onOpenChange, onCandidateAdded }: AddCandidateDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue, watch } = useForm<CandidateForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      position: '',
      experience: '',
      skills: '',
      status: 'active',
      rating: 0
    }
  });

  const onSubmit = async (data: CandidateForm) => {
    try {
      const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
      
      const { error } = await supabase
        .from('candidates')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || null,
          location: data.location || null,
          position: data.position || null,
          experience: data.experience || null,
          skills: skillsArray,
          status: data.status,
          rating: data.rating || 0,
          created_by: user?.id || ''
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Candidate added successfully"
      });

      reset();
      onOpenChange(false);
      onCandidateAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add candidate",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter the candidate's information to add them to your database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input {...register('firstName', { required: true })} placeholder="John" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...register('lastName', { required: true })} placeholder="Doe" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input {...register('email', { required: true })} type="email" placeholder="john.doe@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input {...register('phone')} placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input {...register('location')} placeholder="San Francisco, CA" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input {...register('position')} placeholder="Software Engineer" />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input {...register('experience')} placeholder="5+ years" />
            </div>
          </div>

          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input {...register('skills')} placeholder="React, TypeScript, Node.js" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input {...register('rating', { valueAsNumber: true })} type="number" min="0" max="5" step="0.1" placeholder="4.5" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

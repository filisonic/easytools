import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { recruitmentAPI } from '@/lib/recruitmentAPI';
import { RecruitmentCandidate, BulkCandidateImport, EmailTemplate } from '@/types/recruitment';

export const useRecruitmentCandidates = () => {
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruitmentAPI.candidates.getAll();
      setCandidates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch candidates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCandidate = useCallback(async (candidateData: Omit<RecruitmentCandidate, 'id' | 'token' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newCandidate = await recruitmentAPI.candidates.create(candidateData);
      setCandidates(prev => [newCandidate, ...prev]);
      toast({
        title: "Success",
        description: "Candidate created successfully",
      });
      return newCandidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create candidate';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const bulkCreateCandidates = useCallback(async (candidatesData: BulkCandidateImport[], invitedBy: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCandidates = await recruitmentAPI.candidates.bulkCreate(candidatesData, invitedBy);
      setCandidates(prev => [...newCandidates, ...prev]);
      toast({
        title: "Success",
        description: `Imported ${newCandidates.length} candidates successfully`,
      });
      return newCandidates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import candidates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCandidate = useCallback(async (id: string, updates: Partial<RecruitmentCandidate>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCandidate = await recruitmentAPI.candidates.update(id, updates);
      setCandidates(prev => prev.map(candidate => 
        candidate.id === id ? updatedCandidate : candidate
      ));
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
      return updatedCandidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendBulkEmails = useCallback(async (candidateIds: string[], templateId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await recruitmentAPI.email.oauth.sendBulkEmails(candidateIds, templateId, userId);
      toast({
        title: "Success",
        description: `Emails sent to ${candidateIds.length} candidates`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send emails';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    createCandidate,
    bulkCreateCandidates,
    updateCandidate,
    sendBulkEmails,
  };
};

export const useRecruitmentStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruitmentAPI.getStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruitmentAPI.email.templates.getAll();
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createTemplate = useCallback(async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate = await recruitmentAPI.email.templates.create(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTemplate = await recruitmentAPI.email.templates.update(id, updates);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
  };
};

export const useRecruitment = () => {
  const candidatesHook = useRecruitmentCandidates();
  const statsHook = useRecruitmentStats();
  const templatesHook = useEmailTemplates();

  const isLoading = candidatesHook.loading || statsHook.loading || templatesHook.loading;
  const hasError = candidatesHook.error || statsHook.error || templatesHook.error;

  return {
    candidates: candidatesHook,
    stats: statsHook,
    templates: templatesHook,
    isLoading,
    hasError,
  };
};
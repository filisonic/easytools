import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import n8nService from '../services/n8nService';
import { Candidate, Job, Application, DashboardStats, N8NError } from '../types/n8n';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.getCandidates();
      if (response.success && response.data) {
        setCandidates(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch candidates');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to fetch candidates';
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

  const submitApplication = useCallback(async (candidate: Candidate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.submitCandidateApplication(candidate);
      if (response.success) {
        toast({
          title: "Success",
          description: "Application submitted successfully",
        });
        // Don't auto-refresh candidates after submission to avoid 500 errors
        // await fetchCandidates();
        return response;
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to submit application';
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
  }, [toast, fetchCandidates]);

  const updateCandidate = useCallback(async (candidateId: string, updates: Partial<Candidate>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.updateCandidate(candidateId, updates);
      if (response.success) {
        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
        await fetchCandidates();
        return response;
      } else {
        throw new Error(response.error || 'Failed to update candidate');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to update candidate';
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
  }, [toast, fetchCandidates]);

  // Removed auto-fetch on mount to avoid 500 errors on page load
  // Call fetchCandidates() manually when needed

  return {
    candidates,
    loading,
    error,
    submitApplication,
    updateCandidate,
    fetchCandidates,
  };
};

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.getJobs();
      if (response.success && response.data) {
        setJobs(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to fetch jobs';
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

  const createJob = useCallback(async (job: Job) => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.createJob(job);
      if (response.success) {
        toast({
          title: "Success",
          description: "Job created successfully",
        });
        await fetchJobs();
        return response;
      } else {
        throw new Error(response.error || 'Failed to create job');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to create job';
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
  }, [toast, fetchJobs]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.updateJob(jobId, updates);
      if (response.success) {
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
        await fetchJobs();
        return response;
      } else {
        throw new Error(response.error || 'Failed to update job');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to update job';
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
  }, [toast, fetchJobs]);

  // Removed auto-fetch on mount - call fetchJobs() manually when needed

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    fetchJobs,
  };
};

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.getApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch applications');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to fetch applications';
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

  const updateApplicationStatus = useCallback(async (
    appId: string,
    status: string,
    stage: string,
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.updateApplicationStatus(appId, status, stage, notes);
      if (response.success) {
        toast({
          title: "Success",
          description: "Application status updated successfully",
        });
        await fetchApplications();
        return response;
      } else {
        throw new Error(response.error || 'Failed to update application status');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to update application status';
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
  }, [toast, fetchApplications]);

  // Removed auto-fetch on mount - call fetchApplications() manually when needed

  return {
    applications,
    loading,
    error,
    updateApplicationStatus,
    fetchApplications,
  };
};

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await n8nService.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      const errorMessage = err instanceof N8NError ? err.message : 'Failed to fetch dashboard stats';
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

  // Removed auto-fetch on mount - call refreshStats() manually when needed

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};

export const useRecruitment = () => {
  const candidatesHook = useCandidates();
  const jobsHook = useJobs();
  const applicationsHook = useApplications();
  const dashboardHook = useDashboard();

  const isLoading = candidatesHook.loading || jobsHook.loading || applicationsHook.loading || dashboardHook.loading;
  const hasError = candidatesHook.error || jobsHook.error || applicationsHook.error || dashboardHook.error;

  return {
    candidates: candidatesHook,
    jobs: jobsHook,
    applications: applicationsHook,
    dashboard: dashboardHook,
    isLoading,
    hasError,
  };
};
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import supabaseService, { type Candidate, type Job, type CandidateInsert, type JobInsert } from '../services/supabaseService';

export const useSupabaseCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCandidates = useCallback(async () => {
    console.log('useSupabaseCandidates: Starting fetch...');
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getCandidates();
      console.log('useSupabaseCandidates: Fetched data:', data);
      setCandidates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch candidates';
      console.error('useSupabaseCandidates: Error:', err);
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

  const createCandidate = useCallback(async (candidateData: CandidateInsert) => {
    setLoading(true);
    setError(null);
    try {
      const newCandidate = await supabaseService.createCandidate(candidateData);
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

  const updateCandidate = useCallback(async (candidateId: string, updates: Partial<Candidate>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCandidate = await supabaseService.updateCandidate(candidateId, updates);
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId ? updatedCandidate : candidate
        )
      );
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

  const updateCandidateStatus = useCallback(async (candidateId: string, status: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCandidate = await supabaseService.updateCandidateStatus(candidateId, status, notes);
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId ? updatedCandidate : candidate
        )
      );
      toast({
        title: "Success",
        description: "Candidate status updated successfully",
      });
      return updatedCandidate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate status';
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
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidate,
    updateCandidateStatus,
    fetchCandidates,
  };
};

export const useSupabaseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getJobs();
      setJobs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
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

  const createJob = useCallback(async (jobData: JobInsert) => {
    setLoading(true);
    setError(null);
    try {
      const newJob = await supabaseService.createJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
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

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedJob = await supabaseService.updateJob(jobId, updates);
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId ? updatedJob : job
        )
      );
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
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

  const deleteJob = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
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
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    fetchJobs,
  };
};

export const useSupabaseDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
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
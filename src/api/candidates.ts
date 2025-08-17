import { recruitmentService } from '@/services/recruitmentService';
import { RecruitmentCandidate, BulkCandidateImport } from '@/types/recruitment';

export class CandidatesAPI {
  // GET /api/candidates
  async getAll(): Promise<{ data: RecruitmentCandidate[]; error?: string }> {
    try {
      const candidates = await recruitmentService.getCandidates();
      return { data: candidates };
    } catch (error) {
      console.error('API: Error fetching candidates:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch candidates' 
      };
    }
  }

  // GET /api/candidates/:token
  async getByToken(token: string): Promise<{ data: RecruitmentCandidate | null; error?: string }> {
    try {
      const candidate = await recruitmentService.getCandidateByToken(token);
      return { data: candidate };
    } catch (error) {
      console.error('API: Error fetching candidate by token:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch candidate' 
      };
    }
  }

  // POST /api/candidates
  async create(candidateData: Omit<RecruitmentCandidate, 'id' | 'token' | 'created_at' | 'updated_at'>): Promise<{ data: RecruitmentCandidate | null; error?: string }> {
    try {
      const candidate = await recruitmentService.createCandidate(candidateData);
      return { data: candidate };
    } catch (error) {
      console.error('API: Error creating candidate:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create candidate' 
      };
    }
  }

  // POST /api/candidates/bulk
  async bulkCreate(candidates: BulkCandidateImport[], invitedBy: string): Promise<{ data: RecruitmentCandidate[]; error?: string }> {
    try {
      const createdCandidates = await recruitmentService.bulkCreateCandidates(candidates, invitedBy);
      return { data: createdCandidates };
    } catch (error) {
      console.error('API: Error bulk creating candidates:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to create candidates' 
      };
    }
  }

  // PUT /api/candidates/:id
  async update(id: string, updates: Partial<RecruitmentCandidate>): Promise<{ data: RecruitmentCandidate | null; error?: string }> {
    try {
      const candidate = await recruitmentService.updateCandidate(id, updates);
      return { data: candidate };
    } catch (error) {
      console.error('API: Error updating candidate:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update candidate' 
      };
    }
  }

  // PUT /api/candidates/token/:token
  async updateByToken(token: string, updates: Partial<RecruitmentCandidate>): Promise<{ data: RecruitmentCandidate | null; error?: string }> {
    try {
      const candidate = await recruitmentService.updateCandidateByToken(token, updates);
      return { data: candidate };
    } catch (error) {
      console.error('API: Error updating candidate by token:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update candidate' 
      };
    }
  }

  // POST /api/candidates/:token/apply
  async submitApplication(token: string, applicationData: {
    phone?: string;
    experience?: string;
    skills?: string[];
    resume_url?: string;
  }): Promise<{ data: RecruitmentCandidate | null; error?: string }> {
    try {
      const candidate = await recruitmentService.getCandidateByToken(token);
      if (!candidate) {
        return { data: null, error: 'Invalid application token' };
      }

      // Update candidate with application data
      const updatedCandidate = await recruitmentService.updateCandidateByToken(token, {
        ...applicationData,
        status: 'applied',
        applied_at: new Date().toISOString(),
      });

      // Submit to N8N workflow
      try {
        await recruitmentService.submitToN8N(updatedCandidate);
        
        // Update status to AI analyzed
        const finalCandidate = await recruitmentService.updateCandidate(updatedCandidate.id!, {
          status: 'ai_analyzed'
        });
        
        return { data: finalCandidate };
      } catch (n8nError) {
        console.error('Failed to submit to N8N:', n8nError);
        // Keep candidate in applied state even if N8N fails
        return { data: updatedCandidate };
      }
    } catch (error) {
      console.error('API: Error submitting application:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to submit application' 
      };
    }
  }

  // GET /api/candidates/stats
  async getStats(): Promise<{ data: any; error?: string }> {
    try {
      const stats = await recruitmentService.getRecruitmentStats();
      return { data: stats };
    } catch (error) {
      console.error('API: Error fetching stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      };
    }
  }
}

export const candidatesAPI = new CandidatesAPI();
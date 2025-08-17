import { n8nService } from '@/services/n8nService';
import { Candidate, Job, Application } from '@/types/n8n';

export class WebhookAPI {
  // POST /api/webhook/candidates - Proxy to n8n easyhrtools-candidates
  async handleCandidatesWebhook(data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log('Webhook: Processing candidates request:', data);
      
      const result = await n8nService.getCandidates();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process candidates webhook');
      }

      return { data: result };
    } catch (error) {
      console.error('Webhook: Candidates error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Webhook processing failed' 
      };
    }
  }

  // POST /api/webhook/jobs - Proxy to n8n easyhrtools-jobs
  async handleJobsWebhook(data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log('Webhook: Processing jobs request:', data);
      
      let result;
      
      switch (data.action) {
        case 'get_all':
          result = await n8nService.getJobs();
          break;
        case 'create':
          result = await n8nService.createJob(data as Job);
          break;
        case 'update':
          result = await n8nService.updateJob(data.job_id, data);
          break;
        case 'delete':
          result = await n8nService.deleteJob(data.job_id);
          break;
        default:
          throw new Error(`Unknown jobs action: ${data.action}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process jobs webhook');
      }

      return { data: result };
    } catch (error) {
      console.error('Webhook: Jobs error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Webhook processing failed' 
      };
    }
  }

  // POST /api/webhook/form-test/automation-specialist-supabase - Handle recruitment application submissions
  async handleRecruitmentFormWebhook(data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log('Webhook: Processing recruitment form submission:', data);
      
      // Map form data to N8N expected format
      const formData = {
        first_name: data.first_name || data.name?.split(' ')[0] || '',
        last_name: data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        experience: data.experience || '',
        skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(',') || [],
        cover_letter: data.cover_letter || '',
        resume_file: data.resume_file || data.resume_binary,
        job_id: data.job_id || data.target_job_id,
      };

      // Submit to N8N HR Resume Screener workflow
      const result = await n8nService.triggerHRResumeScreenerSupabaseComplete(formData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process recruitment form');
      }

      return { 
        data: {
          success: true,
          candidate_id: result.candidate_id,
          message: 'Application submitted successfully',
          screening_result: result.screening_result,
          ...result
        }
      };
    } catch (error) {
      console.error('Webhook: Recruitment form error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Form submission failed' 
      };
    }
  }

  // POST /api/webhook/ats - Handle ATS operations
  async handleATSWebhook(data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log('Webhook: Processing ATS request:', data);
      
      let result;
      
      switch (data.action) {
        case 'get_applications':
          result = await n8nService.getApplications();
          break;
        case 'update_status':
          result = await n8nService.updateApplicationStatus(
            data.application_id, 
            data.status, 
            data.stage, 
            data.notes
          );
          break;
        case 'get_stats':
          result = await n8nService.getDashboardStats();
          break;
        default:
          throw new Error(`Unknown ATS action: ${data.action}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process ATS webhook');
      }

      return { data: result };
    } catch (error) {
      console.error('Webhook: ATS error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'ATS webhook processing failed' 
      };
    }
  }

  // POST /api/webhook/interview - Handle interview scheduling
  async handleInterviewWebhook(data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log('Webhook: Processing interview request:', data);
      
      const result = await n8nService.scheduleInterview(data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule interview');
      }

      return { data: result };
    } catch (error) {
      console.error('Webhook: Interview error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Interview webhook processing failed' 
      };
    }
  }

  // Generic webhook handler for any endpoint
  async handleGenericWebhook(endpoint: string, data: any): Promise<{ data: any; error?: string }> {
    try {
      console.log(`Webhook: Processing generic request for ${endpoint}:`, data);
      
      // Use the n8nService makeRequest method directly
      const result = await (n8nService as any).makeRequest(endpoint, data);
      
      return { data: result };
    } catch (error) {
      console.error(`Webhook: Generic error for ${endpoint}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Generic webhook processing failed' 
      };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ data: any; error?: string }> {
    try {
      // Test connection to N8N
      const testResult = await n8nService.getDashboardStats();
      
      return {
        data: {
          status: 'healthy',
          n8n_connected: testResult.success,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Webhook: Health check error:', error);
      return {
        data: {
          status: 'unhealthy',
          n8n_connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }
      };
    }
  }
}

export const webhookAPI = new WebhookAPI();
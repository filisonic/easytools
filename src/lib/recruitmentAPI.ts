import { recruitmentService } from '@/services/recruitmentService';
import { RecruitmentCandidate, BulkCandidateImport, EmailTemplate, GmailOAuthState } from '@/types/recruitment';

// Gmail OAuth Configuration
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = import.meta.env.VITE_GMAIL_CLIENT_SECRET || '';
const GMAIL_REDIRECT_URI = `${window.location.origin}/auth/gmail/callback`;
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';

export const recruitmentAPI = {
  // Candidate Management
  candidates: {
    async getAll(): Promise<RecruitmentCandidate[]> {
      return await recruitmentService.getCandidates();
    },

    async getByToken(token: string): Promise<RecruitmentCandidate | null> {
      return await recruitmentService.getCandidateByToken(token);
    },

    async create(candidate: Omit<RecruitmentCandidate, 'id' | 'token' | 'created_at' | 'updated_at'>): Promise<RecruitmentCandidate> {
      return await recruitmentService.createCandidate(candidate);
    },

    async bulkCreate(candidates: BulkCandidateImport[], invitedBy: string): Promise<RecruitmentCandidate[]> {
      return await recruitmentService.bulkCreateCandidates(candidates, invitedBy);
    },

    async update(id: string, updates: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
      return await recruitmentService.updateCandidate(id, updates);
    },

    async updateByToken(token: string, updates: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
      return await recruitmentService.updateCandidateByToken(token, updates);
    },

    async submitApplication(token: string, applicationData: {
      phone?: string;
      experience?: string;
      skills?: string[];
      resume_url?: string;
    }): Promise<RecruitmentCandidate> {
      const candidate = await recruitmentService.getCandidateByToken(token);
      if (!candidate) {
        throw new Error('Invalid application token');
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
        return await recruitmentService.updateCandidate(updatedCandidate.id!, {
          status: 'ai_analyzed'
        });
      } catch (error) {
        console.error('Failed to submit to N8N:', error);
        // Keep candidate in applied state even if N8N fails
        return updatedCandidate;
      }
    },
  },

  // Email Management
  email: {
    templates: {
      async getAll(): Promise<EmailTemplate[]> {
        return await recruitmentService.getEmailTemplates();
      },

      async create(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
        return await recruitmentService.createEmailTemplate(template);
      },

      async update(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
        return await recruitmentService.updateEmailTemplate(id, updates);
      },
    },

    oauth: {
      getAuthUrl(): string {
        const params = new URLSearchParams({
          client_id: GMAIL_CLIENT_ID,
          redirect_uri: GMAIL_REDIRECT_URI,
          scope: GMAIL_SCOPES,
          response_type: 'code',
          access_type: 'offline',
          prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      },

      async exchangeCode(code: string, userId: string): Promise<GmailOAuthState> {
        try {
          // Exchange authorization code for tokens
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: GMAIL_CLIENT_ID,
              client_secret: GMAIL_CLIENT_SECRET,
              code,
              grant_type: 'authorization_code',
              redirect_uri: GMAIL_REDIRECT_URI,
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange authorization code');
          }

          const tokens = await tokenResponse.json();

          // Get user email
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          const userInfo = await userResponse.json();

          const oauthState: GmailOAuthState = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + (tokens.expires_in * 1000),
            email: userInfo.email,
            is_connected: true,
          };

          // Store in Supabase (you would need to implement this in recruitmentService)
          // await recruitmentService.storeOAuthState(userId, oauthState);

          return oauthState;
        } catch (error) {
          console.error('OAuth error:', error);
          throw error;
        }
      },

      async sendBulkEmails(candidateIds: string[], templateId: string, userId: string): Promise<void> {
        // This would integrate with Gmail API to send bulk emails
        // For now, we'll create a placeholder that simulates the process
        try {
          const template = await recruitmentService.getEmailTemplates().then(templates => 
            templates.find(t => t.id === templateId)
          );

          if (!template) {
            throw new Error('Email template not found');
          }

          const candidates = await recruitmentService.getCandidates().then(candidates =>
            candidates.filter(c => candidateIds.includes(c.id!))
          );

          // Create email batch record
          const batch = await recruitmentService.createEmailBatch({
            template_id: templateId,
            candidate_ids: candidateIds,
            sent_count: 0,
            failed_count: 0,
            status: 'pending',
            created_by: userId,
          });

          // TODO: Implement actual Gmail API integration
          // For now, simulate email sending
          let sentCount = 0;
          let failedCount = 0;

          for (const candidate of candidates) {
            try {
              // Generate application link
              const applicationLink = `${window.location.origin}/apply/${candidate.token}`;
              
              // Replace placeholders in template
              const personalizedSubject = template.subject
                .replace('{{first_name}}', candidate.first_name)
                .replace('{{position}}', candidate.position);

              const personalizedBody = template.body
                .replace('{{first_name}}', candidate.first_name)
                .replace('{{position}}', candidate.position)
                .replace('{{application_link}}', applicationLink);

              // TODO: Send actual email using Gmail API
              console.log('Would send email:', {
                to: candidate.email,
                subject: personalizedSubject,
                body: personalizedBody,
              });

              sentCount++;
            } catch (error) {
              console.error(`Failed to send email to ${candidate.email}:`, error);
              failedCount++;
            }
          }

          // Update batch status
          await recruitmentService.updateEmailBatch(batch.id!, {
            sent_count: sentCount,
            failed_count: failedCount,
            status: 'completed',
            completed_at: new Date().toISOString(),
          });

        } catch (error) {
          console.error('Bulk email error:', error);
          throw error;
        }
      },
    },
  },

  // Dashboard Stats
  async getStats() {
    return await recruitmentService.getRecruitmentStats();
  },

  // File Upload (for CSV import and resume uploads)
  files: {
    async uploadResume(file: File): Promise<string> {
      // TODO: Implement file upload to Supabase Storage
      // For now, return a placeholder URL
      return `https://example.com/resumes/${file.name}`;
    },

    parseCsvFile(file: File): Promise<BulkCandidateImport[]> {
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
    },
  },
};
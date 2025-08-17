import { recruitmentService } from '@/services/recruitmentService';
import { EmailTemplate, GmailOAuthState } from '@/types/recruitment';

// Gmail OAuth Configuration
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = import.meta.env.VITE_GMAIL_CLIENT_SECRET || '';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';

export class EmailAPI {
  // GET /api/email/templates
  async getTemplates(): Promise<{ data: EmailTemplate[]; error?: string }> {
    try {
      const templates = await recruitmentService.getEmailTemplates();
      return { data: templates };
    } catch (error) {
      console.error('API: Error fetching email templates:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch email templates' 
      };
    }
  }

  // POST /api/email/templates
  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: EmailTemplate | null; error?: string }> {
    try {
      const template = await recruitmentService.createEmailTemplate(templateData);
      return { data: template };
    } catch (error) {
      console.error('API: Error creating email template:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create email template' 
      };
    }
  }

  // PUT /api/email/templates/:id
  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<{ data: EmailTemplate | null; error?: string }> {
    try {
      const template = await recruitmentService.updateEmailTemplate(id, updates);
      return { data: template };
    } catch (error) {
      console.error('API: Error updating email template:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update email template' 
      };
    }
  }

  // GET /api/email/oauth/url
  getOAuthUrl(): { data: { url: string }; error?: string } {
    try {
      const redirectUri = `${window.location.origin}/auth/gmail/callback`;
      const params = new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: GMAIL_SCOPES,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
      });

      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return { data: { url } };
    } catch (error) {
      console.error('API: Error generating OAuth URL:', error);
      return { 
        data: { url: '' }, 
        error: error instanceof Error ? error.message : 'Failed to generate OAuth URL' 
      };
    }
  }

  // POST /api/email/oauth/exchange
  async exchangeCode(code: string, userId: string): Promise<{ data: GmailOAuthState | null; error?: string }> {
    try {
      const redirectUri = `${window.location.origin}/auth/gmail/callback`;
      
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
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokens = await tokenResponse.json();

      // Get user email
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userResponse.json();

      const oauthState: GmailOAuthState = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        email: userInfo.email,
        is_connected: true,
      };

      // TODO: Store in Supabase (implement oauth state storage)
      // await recruitmentService.storeOAuthState(userId, oauthState);

      return { data: oauthState };
    } catch (error) {
      console.error('API: OAuth exchange error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to exchange OAuth code' 
      };
    }
  }

  // POST /api/email/send-bulk
  async sendBulkEmails(candidateIds: string[], templateId: string, userId: string): Promise<{ data: { sent: number; failed: number } | null; error?: string }> {
    try {
      const template = await recruitmentService.getEmailTemplates().then(templates => 
        templates.find(t => t.id === templateId)
      );

      if (!template) {
        return { data: null, error: 'Email template not found' };
      }

      const candidates = await recruitmentService.getCandidates().then(candidates =>
        candidates.filter(c => candidateIds.includes(c.id!))
      );

      if (candidates.length === 0) {
        return { data: null, error: 'No valid candidates found' };
      }

      // Create email batch record
      const batch = await recruitmentService.createEmailBatch({
        template_id: templateId,
        candidate_ids: candidateIds,
        sent_count: 0,
        failed_count: 0,
        status: 'pending',
        created_by: userId,
      });

      let sentCount = 0;
      let failedCount = 0;

      // Process each candidate
      for (const candidate of candidates) {
        try {
          // Generate application link
          const applicationLink = `${window.location.origin}/apply/${candidate.token}`;
          
          // Replace placeholders in template
          const personalizedSubject = template.subject
            .replace(/\{\{first_name\}\}/g, candidate.first_name)
            .replace(/\{\{position\}\}/g, candidate.position);

          const personalizedBody = template.body
            .replace(/\{\{first_name\}\}/g, candidate.first_name)
            .replace(/\{\{position\}\}/g, candidate.position)
            .replace(/\{\{application_link\}\}/g, applicationLink);

          // TODO: Implement actual Gmail API integration
          // For now, simulate email sending
          console.log('Would send email:', {
            to: candidate.email,
            subject: personalizedSubject,
            body: personalizedBody,
          });

          // Simulate success/failure
          const success = Math.random() > 0.1; // 90% success rate
          if (success) {
            sentCount++;
          } else {
            failedCount++;
          }

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

      return { data: { sent: sentCount, failed: failedCount } };

    } catch (error) {
      console.error('API: Bulk email error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to send bulk emails' 
      };
    }
  }

  // POST /api/email/send-gmail
  async sendEmailViaGmail(emailData: {
    to: string;
    subject: string;
    body: string;
    accessToken: string;
  }): Promise<{ data: { messageId: string } | null; error?: string }> {
    try {
      // Create email message in Gmail format
      const email = [
        `To: ${emailData.to}`,
        `Subject: ${emailData.subject}`,
        `Content-Type: text/html; charset="UTF-8"`,
        '',
        emailData.body
      ].join('\n');

      // Encode email in base64url format
      const encodedEmail = btoa(email)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedEmail
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gmail API error: ${errorText}`);
      }

      const result = await response.json();
      return { data: { messageId: result.id } };

    } catch (error) {
      console.error('API: Gmail send error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to send email via Gmail' 
      };
    }
  }

  // GET /api/email/batches
  async getBatches(): Promise<{ data: any[]; error?: string }> {
    try {
      const batches = await recruitmentService.getEmailBatches();
      return { data: batches };
    } catch (error) {
      console.error('API: Error fetching email batches:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch email batches' 
      };
    }
  }
}

export const emailAPI = new EmailAPI();
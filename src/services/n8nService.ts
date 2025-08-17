import { Candidate, Job, Application, DashboardStats, N8NResponse, N8NError, InterviewSchedule, InterviewQuestion, TechnicalExercise } from '../types/n8n';
import { generateUUID } from '../utils/uuid';

class N8NService {
  private get baseUrl() {
    // The proxy will handle rewriting the URL to the n8n server.
    return '';
  }

  private async makeRequest<T>(endpoint: string, data?: any): Promise<N8NResponse<T>> {
    // Construct the URL, ensuring /webhook is correctly handled
    let url: string;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (endpoint.startsWith('http')) {
      url = endpoint; // Use the provided full URL
    } else {
      // Prepend /webhook if it's not already present in the endpoint
      if (cleanEndpoint.startsWith('/webhook')) {
        url = `${this.baseUrl}${cleanEndpoint}`;
      } else {
        url = `${this.baseUrl}/webhook${cleanEndpoint}`;
      }
    }
    
    console.log('N8N Request:', { url, data });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
      });

      console.log('N8N Response Status:', response.status);

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        console.error('N8N Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });

        // Add retry logic for 500 errors
        if (response.status === 500) {
          console.log('Retrying with fallback URL...');
          
          // Try direct endpoint without /webhook prefix
          const fallbackUrl = `${this.baseUrl}${cleanEndpoint}`;
          try {
            const fallbackResponse = await fetch(fallbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data || {}),
            });
            
            if (fallbackResponse.ok) {
              const fallbackText = await fallbackResponse.text();
              console.log('Fallback succeeded:', fallbackText);
              return fallbackText.trim() === '' 
                ? { success: true, message: 'Request processed successfully' } as N8NResponse<T>
                : JSON.parse(fallbackText);
            }
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('N8N Response Text:', responseText);
      
      if (responseText.trim() === '') {
        // Handle empty response as success
        return { success: true, message: 'Request processed successfully' } as N8NResponse<T>;
      }
      
      try {
        const result = JSON.parse(responseText);
        console.log('N8N Response Data:', result);
        return result as N8NResponse<T>;
      } catch (e) {
        // If response is not JSON, treat as success with the text as message
        return { success: true, message: responseText } as N8NResponse<T>;
      }
    } catch (error) {
      console.error(`N8N API Error for ${endpoint}:`, error);
      throw new N8NError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  // Candidate Management
  async submitCandidateApplication(candidate: Candidate): Promise<N8NResponse<{candidate_id: string; analysis: any}>> {
    return this.makeRequest('/new-candidate-trigger', candidate);
  }

  async getCandidates(): Promise<N8NResponse<Candidate[]>> {
    return this.makeRequest('/easyhrtools-candidates', { action: 'get_all' });
  }

  async updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-candidates', {
      action: 'update',
      candidate_id: candidateId,
      ...updates
    });
  }

  // Job Management
  async createJob(job: Job): Promise<N8NResponse<{job_id: string}>> {
    return this.makeRequest('/easyhrtools-jobs', {
      action: 'create',
      ...job
    });
  }

  async getJobs(): Promise<N8NResponse<Job[]>> {
    return this.makeRequest('/easyhrtools-jobs', { action: 'get_all' });
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-jobs', {
      action: 'update',
      job_id: jobId,
      ...updates
    });
  }

  async deleteJob(jobId: string): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-jobs', {
      action: 'delete',
      job_id: jobId
    });
  }

  // ATS System
  async getApplications(): Promise<N8NResponse<Application[]>> {
    return this.makeRequest('/easyhrtools-ats', { action: 'get_applications' });
  }

  async updateApplicationStatus(
    appId: string, 
    status: string, 
    stage: string, 
    notes?: string
  ): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-ats', {
      action: 'update_status',
      application_id: appId,
      status,
      stage,
      notes
    });
  }

  async getDashboardStats(): Promise<N8NResponse<DashboardStats>> {
    return this.makeRequest('/easyhrtools-ats', { action: 'get_stats' });
  }

  // AI Features
  async screenResume(candidateId: string, jobId: string): Promise<N8NResponse<{match_score: number}>> {
    return this.makeRequest('/ai-resume-screening', {
      candidate_id: candidateId,
      job_id: jobId
    });
  }

  // 🎯 HR Resume Screener - Supabase Complete (Binary Fixed Final) workflow
  // This method specifically targets your N8N workflow with the exact name above
  async triggerHRResumeScreenerSupabaseComplete(formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    position: string;
    experience?: string;
    skills?: string[];
    cover_letter?: string;
    resume_file?: File | string; // Can be File object or base64 string
    job_id?: string;
  }): Promise<N8NResponse<{candidate_id: string; screening_result: any}>> {
    
    // Prepare payload exactly as your N8N workflow expects
    const payload = {
      // Core candidate information
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || '',
      position: formData.position,
      experience: formData.experience || '',
      skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || ''),
      cover_letter: formData.cover_letter || '',
      
      // Resume binary data (base64 or file content)
      resume_binary: formData.resume_file,
      resume_filename: formData.resume_file instanceof File ? formData.resume_file.name : 'resume.pdf',
      
      // Job matching
      target_job_id: formData.job_id || '',
      
      // Workflow metadata
      workflow_name: 'HR Resume Screener - Supabase Complete (Binary Fixed Final)',
      trigger_source: 'easyhr_frontend',
      submitted_at: new Date().toISOString()
    };

    console.log('🎯 Triggering "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow:', {
      ...payload,
      resume_binary: payload.resume_binary ? '[BINARY_DATA_PRESENT]' : '[NO_RESUME]'
    });
    
    // Try multiple possible webhook endpoints for this workflow
    const possibleEndpoints = [
      '/form-test/automation-specialist-supabase', // Primary endpoint provided by user
      '/hr-resume-screener-supabase-complete-binary-fixed-final',
      '/hr-resume-screener-complete',
      '/hr-screener-supabase-complete',
      '/resume-screener-binary-fixed',
      '/easyhrtools-resume-screener'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const result = await this.makeRequest<{candidate_id?: string, id?: string, screening_result?: any, analysis?: any, data?: any, message?: string}>(endpoint, payload);
        
        if (result.success !== false) {
          console.log(`✅ SUCCESS with endpoint ${endpoint}:`, result);
          
          return {
            success: true,
            data: {
              candidate_id: result.data?.candidate_id || result.data?.id || generateUUID(),
              screening_result: result.data?.screening_result || result.data?.analysis || result.data,
            },
            message: result.message || `HR Resume Screener - Supabase Complete workflow completed via ${endpoint}`,
          };
        }
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, throw error with helpful message
    throw new Error(`
❌ Could not find active webhook for "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow.

Tried endpoints:
${possibleEndpoints.map(ep => `• ${this.baseUrl}${ep}`).join('\n')}

Please check your N8N workflow and ensure the webhook is active with one of these endpoints.
    `);
  }

  // Send screening invitations via email
  async sendScreeningInvitations(invitationData: {
    recipient_email: string;
    job_id: string;
    job_title: string;
    screening_url: string;
    personalized_message: string;
    invitation_type: string;
    sent_at: string;
  }): Promise<N8NResponse> {
    console.log('📧 Sending screening invitation via N8N:', invitationData);
    
    // Try multiple endpoints for email sending
    const emailEndpoints = [
      '/send-screening-invitation',
      '/send-bulk-email',
      '/easyhrtools-email',
      '/screening-email-sender',
      '/send-email'
    ];
    
    for (const endpoint of emailEndpoints) {
      try {
        const result = await this.makeRequest(endpoint, invitationData);
        if (result.success !== false) {
          console.log(`✅ Email sent successfully via ${endpoint}`);
          return result;
        }
      } catch (error) {
        console.warn(`❌ Email endpoint ${endpoint} failed:`, error);
      }
    }
    
    // If all endpoints fail, throw an error to be caught by the calling function
    throw new N8NError('Failed to send email: all configured endpoints failed.');
  }

  async sendMassEmail(emails: string[], subject: string, body: string, link: string, sender_name: string): Promise<N8NResponse<any>> {
    const payload = {
      emails: emails.join(', '), // Convert array to comma-separated string
      subject,
      message: body, // Use 'message' field name as expected by n8n
      link,
      sender_name,
    };
    // The user provided this specific webhook for the "email blast"
    const webhookUrl = 'https://n8n-railway-production-369c.up.railway.app/webhook/send-emails';
    
    console.log('📧 Sending mass email via custom webhook:', payload);
    
    try {
      // Using makeRequest to handle the POST operation to the full URL
      const result = await this.makeRequest(webhookUrl, payload);
      
      if (result.success !== false) {
        console.log('✅ Mass email workflow triggered successfully.');
        return { success: true, message: 'Mass email campaign started successfully.', data: result };
      } else {
        throw new Error(result.error || 'The mass email workflow returned an error.');
      }
    } catch (error) {
      console.error('❌ Failed to trigger mass email workflow:', error);
      throw new N8NError(
        error instanceof Error ? error.message : 'An unknown error occurred while sending mass email.'
      );
    }
  }

  // Legacy method for backward compatibility  
  async triggerHRResumeScreener(formData: any): Promise<N8NResponse<{candidate_id: string; screening_result: any}>> {
    return this.triggerHRResumeScreenerSupabaseComplete(formData);
  }

  // Alternative method for posting form online (public endpoint)
  async submitPublicHRScreening(formData: any): Promise<N8NResponse> {
    console.log('🌐 Submitting public HR screening form:', formData);
    
    try {
      // Use a public webhook endpoint that doesn't require authentication
      const result = await this.makeRequest('/public-hr-screening', {
        ...formData,
        submitted_at: new Date().toISOString(),
        source: 'public_form'
      });
      
      return {
        success: true,
        message: 'Application submitted successfully. You will be contacted soon.',
        data: result
      };
    } catch (error) {
      console.error('❌ Public HR screening submission error:', error);
      throw error;
    }
  }

  // Workflow Scheduling
  async scheduleWorkflow(workflowData: {
    name: string;
    type: string;
    schedule: string;
    description?: string;
    config?: any;
  }): Promise<N8NResponse<{workflow_id: string}>> {
    return this.makeRequest('/easyhrtools-scheduler', {
      action: 'schedule_workflow',
      ...workflowData
    });
  }

  async getScheduledWorkflows(): Promise<N8NResponse<any[]>> {
    return this.makeRequest('/easyhrtools-scheduler', { action: 'get_workflows' });
  }

  async updateWorkflowStatus(workflowId: string, isActive: boolean): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-scheduler', {
      action: 'update_status',
      workflow_id: workflowId,
      is_active: isActive
    });
  }

  async deleteScheduledWorkflow(workflowId: string): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-scheduler', {
      action: 'delete_workflow',
      workflow_id: workflowId
    });
  }

  async triggerWorkflow(workflowId: string, data?: any): Promise<N8NResponse> {
    return this.makeRequest('/easyhrtools-scheduler', {
      action: 'trigger_workflow',
      workflow_id: workflowId,
      data
    });
  }

  // Interview Scheduling - Using working /webhook/schedule-interview endpoint
  async scheduleInterview(interviewData: InterviewSchedule): Promise<N8NResponse<{interview_id: string}>> {
    // Ensure we have the required fields in the exact format n8n expects
    const requiredPayload = {
      // Required fields that n8n validation checks for
      application_id: interviewData.application_id || generateUUID(),
      scheduled_at: interviewData.scheduled_date, // Must be in ISO format
      interviewer_id: interviewData.interviewer_email, // Use email as ID
      
      // Additional fields for functionality
      duration: 60,
      interview_type: interviewData.interview_type || 'video',
      candidate_email: interviewData.candidate_email,
      interviewer_email: interviewData.interviewer_email,
      candidate_name: interviewData.candidate_name,
      job_title: interviewData.job_title,
      meeting_url: '',
      notes: interviewData.questions ? `Questions: ${JSON.stringify(interviewData.questions)}` : '',
      questions: interviewData.questions || [],
      exercise: interviewData.exercise
    };

    // Debug: Log what we're sending
    console.log('📋 Required validation fields:', {
      application_id: requiredPayload.application_id,
      scheduled_at: requiredPayload.scheduled_at,
      interviewer_id: requiredPayload.interviewer_email
    });

    const payload = requiredPayload;
    
    console.log('🚀 Sending to /schedule-interview (working endpoint):', payload);
    console.log('📧 Email addresses being sent:', {
      candidate_email: payload.candidate_email,
      interviewer_email: payload.interviewer_email
    });
    
    try {
      const result = await this.makeRequest<{interview_id?: string}>('/schedule-interview', payload);
      console.log('✅ Schedule interview response:', result);
      
      // Return success with interview_id for compatibility
      return {
        success: true,
        data: {
          interview_id: result.data?.interview_id || generateUUID()
        }
      };
    } catch (error) {
      console.error('Schedule interview error:', error);
      throw error;
    }
  }

  // Automated Interview Scheduling with GPT-4o and Google Calendar Chat Bot
  async scheduleInterviewWithAI(interviewData: InterviewSchedule): Promise<N8NResponse<{interview_id: string; scheduling_link?: string}>> {
    // Format as chat message for GPT-4o workflow
    const chatMessage = `Hi! I need to schedule an interview. Here are the details:

Candidate: ${interviewData.candidate_name}
Email: ${interviewData.candidate_email}
Job Title: ${interviewData.job_title}
Interview Type: ${interviewData.interview_type}
Interviewer Email: ${interviewData.interviewer_email}

Please generate multiple time slot options and create a scheduling link for the candidate to choose their preferred time. Include the interview questions and any technical exercises in the scheduling email.

Additional Details:
- Application ID: ${interviewData.application_id}
- Interview Questions: ${interviewData.questions?.length || 0} questions prepared
- Technical Exercise: ${interviewData.exercise ? 'Yes' : 'No'}
- Scheduling Mode: Self-scheduling with AI assistance`;

    const payload = {
      chatInput: chatMessage
    };
    
    console.log('🤖 Sending to AI Interview Scheduling workflow (Chat Mode):', payload);
    
    try {
      // Use the specific webhook ID provided
      const result = await this.makeRequest<{interview_id?: string, scheduling_link?: string, link?: string, response?: string, message?: string}>('/0c8f9f17-f5f3-4b5d-85e7-071ced0213ae', payload);
      console.log('✅ AI Interview Scheduling response:', result);
      
      // Parse the response and extract relevant information
      return {
        success: true,
        data: {
          interview_id: result.data?.interview_id || generateUUID(),
          scheduling_link: result.data?.scheduling_link || result.data?.link,
        },
        message: result.message || result.data?.response,
      };
    } catch (error) {
      console.error('AI Interview Scheduling error:', error);
      throw error;
    }
  }

  async getInterviewSchedules(): Promise<N8NResponse<InterviewSchedule[]>> {
    // Use enhanced easyhrtools-ats workflow for data retrieval
    const payload = { action: 'get_interviews' };
    console.log('Fetching interviews with payload:', payload);
    
    try {
      const result = await this.makeRequest<InterviewSchedule[]>('/easyhrtools-ats', payload);
      console.log('Get interviews response:', result);
      return result;
    } catch (error) {
      console.error('Get interviews error:', error);
      throw error;
    }
  }

  async updateInterviewStatus(interviewId: string, status: string): Promise<N8NResponse> {
    // Use enhanced easyhrtools-ats workflow for status updates
    return this.makeRequest('/easyhrtools-ats', {
      action: 'update_interview_status',
      interview_id: interviewId,
      status: status
    });
  }

  // Email sending - Send to both candidate and interviewer
  async sendInterviewEmail(interviewId: string, emailData: {
    candidate_email: string;
    candidate_name: string;
    job_title: string;
    questions: InterviewQuestion[];
    exercise?: TechnicalExercise;
    interviewer_name?: string;
    interviewer_email?: string;
    interview_date?: string;
  }): Promise<N8NResponse> {
    const payload = {
      interview_id: interviewId,
      candidate_email: emailData.candidate_email,
      candidate_name: emailData.candidate_name,
      job_title: emailData.job_title,
      interviewer_email: emailData.interviewer_email,
      interviewer_name: emailData.interviewer_name,
      interview_date: emailData.interview_date,
      questions: emailData.questions,
      exercise: emailData.exercise,
      email_type: 'interview_invitation' // Add email type for n8n routing
    };
    
    console.log('Sending interview email with payload:', payload);
    
    try {
      // Try to send email via your enhanced interview workflow
      const result = await this.makeRequest('/schedule-interview', {
        action: 'send_email',
        ...payload
      });
      
      console.log('Email sending response:', result);
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      
      // Fallback: Use Gmail node directly if available
      try {
        const fallbackResult = await this.makeRequest('/send-interview-email', payload);
        console.log('Fallback email sending response:', fallbackResult);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback email sending error:', fallbackError);
        return { success: false, error: 'Failed to send interview email' } as N8NResponse;
      }
    }
  }

  // Enhanced AI Features - With proper fallback system
  async getInterviewQuestions(jobPosition: string, skills: string[]): Promise<N8NResponse<InterviewQuestion[]>> {
    try {
      // Try the AI Interview Questions webhook first
      const result = await this.makeRequest<InterviewQuestion[]>('/ai-interview-questions', {
        action: 'generate_questions',
        job_position: jobPosition,
        skills: skills,
        question_types: ['technical', 'behavioral', 'situational'],
        difficulty: 'medium',
        count: 5
      });
      
      console.log('AI questions generated successfully:', result);
      return result;
    } catch (error) {
      console.warn('AI webhook not available, using enhanced fallback questions for:', jobPosition);
      
      // Enhanced fallback - job-specific questions
      return this.generateFallbackQuestions(jobPosition, skills);
    }
  }

  private generateFallbackQuestions(jobTitle: string, skills: string[]): N8NResponse<InterviewQuestion[]> {
    const primarySkill = skills[0] || 'relevant technologies';
    const jobLower = jobTitle.toLowerCase();
    
    const questions = [
      `Tell me about your experience with ${primarySkill} in ${jobTitle} roles.`,
      `How would you approach a challenging ${jobTitle} project using ${skills.slice(0, 2).join(' and ')}?`,
      `Describe a time when you had to solve a complex problem in your ${jobTitle} work.`,
      `What interests you most about this ${jobTitle} position at our company?`,
      `How do you stay current with ${primarySkill} trends and best practices?`
    ];
    
    return {
      success: true,
      data: questions.map((q, i) => ({
        id: (i + 1).toString(),
        question: q,
        category: i < 2 ? 'technical' : 'behavioral',
        skills: i < 2 ? skills.slice(0, 2) : []
      }))
    };
  }

  async getTechnicalExercise(skills: string[], difficulty: 'easy' | 'medium' | 'hard'): Promise<N8NResponse<TechnicalExercise>> {
    try {
      // Try the AI Interview Questions webhook for exercises too
      const result = await this.makeRequest<TechnicalExercise>('/ai-interview-questions', {
        action: 'generate_exercise',
        skills: skills,
        difficulty: difficulty,
        exercise_type: 'coding_challenge',
        time_limit: 60,
        programming_language: skills.includes('Python') ? 'python' : 'javascript'
      });
      
      console.log('AI exercise generated successfully:', result);
      return result;
    } catch (error) {
      console.warn('AI webhook not available, using enhanced fallback exercise for skills:', skills);
      
      // Enhanced fallback - skill-specific exercises
      return this.generateFallbackExercise(skills, difficulty);
    }
  }

  private generateFallbackExercise(skills: string[], difficulty: 'easy' | 'medium' | 'hard'): N8NResponse<TechnicalExercise> {
    const primarySkill = skills[0] || 'Programming';
    const difficultyCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    // Create skill-specific exercises
    const skillExercises = {
      'React': {
        title: `React ${difficultyCapitalized} Component Challenge`,
        description: 'Build a reusable React component with proper state management.',
        starter_code: `import React, { useState } from 'react';\n\nfunction Component() {\n  // Your implementation here\n  return <div>Hello World</div>;\n}\n\nexport default Component;`
      },
      'Python': {
        title: `Python ${difficultyCapitalized} Algorithm Challenge`,
        description: 'Implement an efficient algorithm using Python best practices.',
        starter_code: `def solution(input_data):\n    \"\"\"\n    Your implementation here\n    \"\"\"\n    pass\n\nif __name__ == "__main__":\n    print(solution([]))`
      },
      'JavaScript': {
        title: `JavaScript ${difficultyCapitalized} Function Challenge`,
        description: 'Create a JavaScript function that demonstrates modern ES6+ features.',
        starter_code: `function solution(data) {\n  // Your implementation here\n  return null;\n}\n\nexport default solution;`
      }
    };
    
    const exercise = skillExercises[primarySkill] || skillExercises['JavaScript'];
    
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        title: exercise.title,
        description: exercise.description,
        skills: skills,
        difficulty: difficulty,
        time_limit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 90,
        instructions: `${exercise.description}\n\nRequirements:\n1. Use ${primarySkill} best practices\n2. Write clean, readable code\n3. Handle edge cases appropriately\n4. Include proper error handling\n\nFocus on demonstrating your ${primarySkill} expertise.`,
        starter_code: exercise.starter_code,
        test_cases: [
          'Code runs without errors',
          'Handles normal input correctly', 
          'Handles edge cases properly',
          `Follows ${primarySkill} best practices`
        ]
      }
    };
  }
}

export const n8nService = new N8NService();
export default n8nService;

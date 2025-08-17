import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InterviewQuestion, TechnicalExercise } from '@/types/n8n';
import { Mail, FileText, Code, Clock, User } from 'lucide-react';

interface InterviewEmailPreviewProps {
  candidateName: string;
  jobTitle: string;
  interviewerName?: string;
  interviewDate?: string;
  questions: InterviewQuestion[];
  exercise?: TechnicalExercise;
  customMessage?: string;
}

export function InterviewEmailPreview({
  candidateName,
  jobTitle,
  interviewerName,
  interviewDate,
  questions,
  exercise,
  customMessage
}: InterviewEmailPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Interview Email Preview</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          This is how the interview email will appear to the candidate
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <div className="space-y-2 mb-4">
            <p><strong>To:</strong> {candidateName.toLowerCase().replace(' ', '.')}@email.com</p>
            <p><strong>From:</strong> {interviewerName || 'HR Team'}</p>
            <p><strong>Subject:</strong> Interview Invitation - {jobTitle} Position</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <p>Dear {candidateName},</p>
            </div>
            
            <div>
              <p>We are pleased to invite you for an interview for the <strong>{jobTitle}</strong> position at our company.</p>
            </div>

            {interviewDate && (
              <div>
                <p><strong>Interview Details:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Date & Time: {formatDate(interviewDate)}</li>
                  <li>Position: {jobTitle}</li>
                  {interviewerName && <li>Interviewer: {interviewerName}</li>}
                </ul>
              </div>
            )}

            {customMessage && (
              <div>
                <p>{customMessage}</p>
              </div>
            )}

            {questions.length > 0 && (
              <div>
                <p><strong>Interview Questions:</strong></p>
                <p>Please take some time to prepare answers for the following questions:</p>
                <div className="space-y-3 mt-3">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {question.category}
                        </Badge>
                        <span className="text-xs text-gray-500">Question {index + 1}</span>
                      </div>
                      <p className="text-sm">{question.question}</p>
                      {question.skills && question.skills.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {question.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exercise && (
              <div>
                <p><strong>Technical Exercise:</strong></p>
                <div className="bg-white p-4 rounded border-l-4 border-green-500 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{exercise.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {exercise.difficulty}
                      </Badge>
                      {exercise.time_limit && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {exercise.time_limit}min
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm">Skills Required:</p>
                      <div className="flex gap-1 mt-1">
                        {exercise.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm">Instructions:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{exercise.instructions}</p>
                    </div>
                    
                    {exercise.starter_code && (
                      <div>
                        <p className="font-medium text-sm">Starter Code:</p>
                        <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mt-1">
                          <pre>{exercise.starter_code}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p>Please confirm your availability for this interview by replying to this email.</p>
            </div>

            <div>
              <p>If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
            </div>

            <div>
              <p>We look forward to meeting with you!</p>
              <br />
              <p>Best regards,<br />
              {interviewerName || 'The Hiring Team'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{questions.length} Questions</span>
          </div>
          {exercise && (
            <div className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>Technical Exercise</span>
            </div>
          )}
          {exercise?.time_limit && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{exercise.time_limit} min limit</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
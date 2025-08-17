import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewScheduler } from './InterviewScheduler';
import { InterviewEmailPreview } from './InterviewEmailPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Candidate, Job, InterviewQuestion, TechnicalExercise } from '@/types/n8n';
import { Calendar, Mail, Code, FileText } from 'lucide-react';

export function InterviewDemo() {
  const [showPreview, setShowPreview] = useState(false);

  // Sample data
  const sampleCandidate: Candidate = {
    id: "demo-1",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    position: "Frontend Developer",
    skills: ["React", "TypeScript", "Node.js", "CSS", "JavaScript"],
    experience: "3 years",
    status: "active"
  };

  const sampleJob: Job = {
    id: "job-1",
    title: "Senior Frontend Developer",
    description: "Looking for an experienced React developer to join our team",
    requirements: ["React", "TypeScript", "Node.js", "3+ years experience"],
    location: "San Francisco, CA",
    salary_range: "$80,000 - $120,000",
    employment_type: "full-time",
    status: "active"
  };

  const sampleQuestions: InterviewQuestion[] = [
    {
      id: "q1",
      question: "Can you explain the difference between controlled and uncontrolled components in React?",
      category: "technical",
      skills: ["React"]
    },
    {
      id: "q2", 
      question: "How do you handle type safety in a large TypeScript codebase?",
      category: "technical",
      skills: ["TypeScript"]
    },
    {
      id: "q3",
      question: "Describe a challenging project you worked on and how you overcame the obstacles.",
      category: "behavioral",
      skills: []
    },
    {
      id: "q4",
      question: "How do you stay updated with the latest frontend technologies and best practices?",
      category: "cultural", 
      skills: []
    }
  ];

  const sampleExercise: TechnicalExercise = {
    id: "ex1",
    title: "React Component Challenge",
    description: "Build a reusable data table component with sorting and filtering capabilities",
    skills: ["React", "TypeScript", "CSS"],
    difficulty: "medium",
    time_limit: 90,
    instructions: `Create a React component that displays a list of users in a table format.

Requirements:
1. Display user data (name, email, role, status)
2. Implement sorting by clicking column headers
3. Add a search/filter input to filter users by name
4. Style the component to be responsive
5. Use TypeScript for type safety

Bonus points:
- Add pagination if time permits
- Implement keyboard navigation
- Add loading and error states`,
    starter_code: `import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface UserTableProps {
  users: User[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  // Your implementation here
  
  return (
    <div>
      {/* Your component JSX here */}
    </div>
  );
};`,
    test_cases: [
      "Component renders without crashing",
      "Displays all user data correctly", 
      "Sorting works for all columns",
      "Search filter works correctly",
      "Component is responsive on mobile"
    ]
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Interview Scheduling Demo</h2>
        <p className="text-muted-foreground">
          This demonstrates the n8n-powered interview scheduling system with AI-generated questions and exercises
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sample Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {sampleCandidate.first_name} {sampleCandidate.last_name}
              </div>
              <div>
                <strong>Email:</strong> {sampleCandidate.email}
              </div>
              <div>
                <strong>Position:</strong> {sampleCandidate.position}
              </div>
              <div>
                <strong>Experience:</strong> {sampleCandidate.experience}
              </div>
              <div className="flex gap-1 flex-wrap">
                <strong>Skills:</strong>
                {sampleCandidate.skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sample Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Title:</strong> {sampleJob.title}
              </div>
              <div>
                <strong>Location:</strong> {sampleJob.location}
              </div>
              <div>
                <strong>Salary:</strong> {sampleJob.salary_range}
              </div>
              <div>
                <strong>Type:</strong> {sampleJob.employment_type}
              </div>
              <div className="flex gap-1 flex-wrap">
                <strong>Requirements:</strong>
                {sampleJob.requirements?.map((req, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scheduler" className="w-full">
        <TabsList>
          <TabsTrigger value="scheduler">Interview Scheduler</TabsTrigger>
          <TabsTrigger value="preview">Email Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduler">
          <InterviewScheduler 
            candidate={sampleCandidate}
            job={sampleJob}
            applicationId="app-demo-1"
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This is how the interview email would appear to the candidate
              </p>
            </div>
            <InterviewEmailPreview
              candidateName={`${sampleCandidate.first_name} ${sampleCandidate.last_name}`}
              jobTitle={sampleJob.title}
              interviewerName="John Smith"
              interviewDate="2024-02-15T14:00:00"
              questions={sampleQuestions}
              exercise={sampleExercise}
              customMessage="We're excited to learn more about your experience and discuss how you might contribute to our team."
            />
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Code className="h-5 w-5" />
            N8N Workflow Integration Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded border text-sm">
              <strong>🎉 Perfect Setup!</strong> Your interview infrastructure is already comprehensive. Only enhanced with AI features.
            </div>
            
            <p className="text-sm">
              Your interview system now integrates <strong>existing advanced workflows</strong> with new AI capabilities:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700 dark:text-green-300">✅ Your Existing System:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><code>/schedule-interview</code> - Full scheduling with calendar & email</li>
                  <li><code>/easyhrtools-ats</code> - Enhanced with interview CRUD</li>
                  <li><code>Google Calendar</code> - Automatic event creation</li>
                  <li><code>Gmail</code> - Automated interview invitations</li>
                  <li><code>Supabase</code> - Complete data management</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">🆕 AI Enhancement Added:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><code>/ai-interview-assistant</code> - Advanced AI question generation ✅</li>
                  <li><code>Technical exercises</code> - AI-powered coding challenges ✅</li>
                  <li><code>GPT-4 integration</code> - Smart content creation ✅</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>AI-powered question generation based on job requirements</li>
                  <li>Skill-specific technical exercises</li>
                  <li>Automated email sending with custom templates</li>
                  <li>Interview tracking and status management</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs font-mono">
              <div className="text-green-600">✓ N8N Service endpoints configured</div>
              <div className="text-green-600">✓ TypeScript types defined</div>
              <div className="text-green-600">✓ React hooks implemented</div>
              <div className="text-green-600">✓ UI components ready</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
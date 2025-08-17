import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HRResumeScreenerForm } from '@/components/interview/HRResumeScreenerForm';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, CheckCircle, ArrowRight } from 'lucide-react';

const HRScreener = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              EasyHR
            </h1>
            <Badge variant="outline" className="ml-2">
              AI-Powered
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            HR Resume Screener
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Submit your application and let our AI-powered system automatically screen your resume,
            match you with relevant positions, and fast-track your interview process.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes your resume and matches skills with job requirements
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Supabase Integration</h3>
              <p className="text-sm text-muted-foreground">
                Secure data storage and real-time processing with Supabase backend
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get immediate compatibility scores and next steps in your application
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                  1
                </div>
                <p className="text-sm font-medium">Submit Application</p>
                <p className="text-xs text-muted-foreground">Fill out the form below</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
              <div className="md:hidden w-px h-6 bg-gray-300"></div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                  2
                </div>
                <p className="text-sm font-medium">AI Screening</p>
                <p className="text-xs text-muted-foreground">Automatic resume analysis</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
              <div className="md:hidden w-px h-6 bg-gray-300"></div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                  3
                </div>
                <p className="text-sm font-medium">Match & Contact</p>
                <p className="text-xs text-muted-foreground">Get contacted for interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <HRResumeScreenerForm 
          mode="public"
          onComplete={(result) => {
            // Could add analytics tracking here
            console.log('Public form submitted:', result);
          }}
        />

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Powered by <strong>N8N</strong> workflows and <strong>Supabase</strong> database
          </p>
          <p className="mt-1">
            Your data is processed securely and in compliance with privacy regulations
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRScreener;
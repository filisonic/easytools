import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import n8nService from '@/services/n8nService';
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

export function ScreeningTest() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const testWebhookConnection = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      console.log('🧪 Testing webhook connection to:', 'https://n8n-railway-production-369c.up.railway.app/form-test/automation-specialist-supabase');
      
      // Test with sample data
      const testData = {
        first_name: 'Test',
        last_name: 'Candidate',
        email: 'test@example.com',
        phone: '+1-555-0123',
        position: 'Software Developer',
        experience: '3 years',
        skills: ['JavaScript', 'React', 'Node.js'],
        cover_letter: 'This is a test application to verify the webhook integration.',
        resume_file: 'test-resume-data',
        job_id: 'test-job-id'
      };

      const result = await n8nService.triggerHRResumeScreenerSupabaseComplete(testData);
      
      setTestResults({
        success: true,
        data: result,
        message: 'Webhook connection successful!'
      });

      toast({
        title: "Success",
        description: "Webhook connection test passed",
      });

    } catch (error) {
      console.error('Webhook test failed:', error);
      
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Webhook connection failed'
      });

      toast({
        title: "Test Failed",
        description: "Webhook connection test failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const openScreeningForm = () => {
    window.open('https://n8n-railway-production-369c.up.railway.app/form-test/automation-specialist-supabase', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Webhook Integration Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the connection to your "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testWebhookConnection}
            disabled={testing}
            className="flex-1"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Webhook Connection'
            )}
          </Button>
          
          <Button
            onClick={openScreeningForm}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Form
          </Button>
        </div>

        {testResults && (
          <div className={`p-4 rounded-lg border ${
            testResults.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                testResults.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResults.message}
              </span>
            </div>
            
            <div className="text-sm space-y-2">
              <div>
                <strong>Webhook URL:</strong>
                <p className="font-mono text-xs bg-white p-2 rounded border">
                  https://n8n-railway-production-369c.up.railway.app/form-test/automation-specialist-supabase
                </p>
              </div>
              
              {testResults.success && testResults.data && (
                <div>
                  <strong>Response:</strong>
                  <pre className="font-mono text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {!testResults.success && testResults.error && (
                <div>
                  <strong>Error:</strong>
                  <p className="text-red-700 bg-white p-2 rounded border">
                    {testResults.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Sends sample candidate data to your N8N webhook</li>
            <li>Verifies the "HR Resume Screener - Supabase Complete (Binary Fixed Final)" workflow responds</li>
            <li>Tests the integration between your frontend and N8N backend</li>
            <li>Confirms data format compatibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
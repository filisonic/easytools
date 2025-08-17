import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { recruitmentService } from '@/services/recruitmentService';
import { n8nService } from '@/services/n8nService';
import { candidatesAPI } from '@/api/candidates';
import { webhookAPI } from '@/api/webhook';
import { 
  Database, 
  Check, 
  X, 
  Loader2, 
  TestTube,
  Zap,
  RefreshCw
} from 'lucide-react';

export function DatabaseInitializer() {
  const [status, setStatus] = useState<{
    database: 'checking' | 'success' | 'error';
    n8n: 'checking' | 'success' | 'error';
    webhooks: 'checking' | 'success' | 'error';
  }>({
    database: 'checking',
    n8n: 'checking',
    webhooks: 'checking',
  });
  
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    const results: any[] = [];

    // Test Database Connection
    try {
      const candidates = await recruitmentService.getCandidates();
      setStatus(prev => ({ ...prev, database: 'success' }));
      results.push({ test: 'Database Connection', status: 'success', message: `Found ${candidates.length} candidates` });
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'error' }));
      results.push({ test: 'Database Connection', status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test N8N Connection
    try {
      const healthCheck = await webhookAPI.healthCheck();
      if (healthCheck.data?.n8n_connected) {
        setStatus(prev => ({ ...prev, n8n: 'success' }));
        results.push({ test: 'N8N Connection', status: 'success', message: 'N8N is responding' });
      } else {
        setStatus(prev => ({ ...prev, n8n: 'error' }));
        results.push({ test: 'N8N Connection', status: 'error', message: healthCheck.error || 'N8N not responding' });
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, n8n: 'error' }));
      results.push({ test: 'N8N Connection', status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test Webhooks
    try {
      const webhookTest = await webhookAPI.handleCandidatesWebhook({ action: 'get_all' });
      if (!webhookTest.error) {
        setStatus(prev => ({ ...prev, webhooks: 'success' }));
        results.push({ test: 'Webhook Endpoints', status: 'success', message: 'Webhooks are working' });
      } else {
        setStatus(prev => ({ ...prev, webhooks: 'error' }));
        results.push({ test: 'Webhook Endpoints', status: 'error', message: webhookTest.error });
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, webhooks: 'error' }));
      results.push({ test: 'Webhook Endpoints', status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }

    setTestResults(results);
    setLoading(false);
  };

  const initializeDatabase = async () => {
    setLoading(true);
    try {
      // Force table creation by calling the service method
      await recruitmentService.getCandidates();
      
      toast({
        title: "Success",
        description: "Database tables initialized successfully",
      });
      
      await checkStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testN8NEndpoints = async () => {
    setLoading(true);
    const endpointTests = [];

    // Test various N8N endpoints
    const endpoints = [
      { name: 'Form Test Endpoint', path: '/form-test/automation-specialist-supabase' },
      { name: 'Candidates Endpoint', path: '/easyhrtools-candidates' },
      { name: 'Jobs Endpoint', path: '/easyhrtools-jobs' },
      { name: 'ATS Endpoint', path: '/easyhrtools-ats' },
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await webhookAPI.handleGenericWebhook(endpoint.path, { action: 'test' });
        endpointTests.push({
          test: endpoint.name,
          status: result.error ? 'error' : 'success',
          message: result.error || 'Endpoint responding'
        });
      } catch (error) {
        endpointTests.push({
          test: endpoint.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(prev => [...prev, ...endpointTests]);
    setLoading(false);

    toast({
      title: "Endpoint Tests Complete",
      description: `Tested ${endpoints.length} N8N endpoints`,
    });
  };

  const createTestCandidate = async () => {
    setLoading(true);
    try {
      const testCandidate = {
        first_name: 'Test',
        last_name: 'Candidate',
        email: 'test@example.com',
        position: 'Software Developer',
        status: 'invited' as const,
        invited_by: 'system-test',
      };

      const result = await candidatesAPI.create(testCandidate);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Test candidate created successfully",
      });

      await checkStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test candidate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Recruitment System Initializer
        </CardTitle>
        <CardDescription>
          Initialize and test the recruitment pipeline integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.database)}
                  <span className="font-medium">Database</span>
                </div>
                {getStatusBadge(status.database)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.n8n)}
                  <span className="font-medium">N8N Service</span>
                </div>
                {getStatusBadge(status.n8n)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.webhooks)}
                  <span className="font-medium">Webhooks</span>
                </div>
                {getStatusBadge(status.webhooks)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkStatus} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          
          <Button onClick={initializeDatabase} disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            Initialize Database
          </Button>
          
          <Button onClick={testN8NEndpoints} disabled={loading} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Test N8N Endpoints
          </Button>
          
          <Button onClick={createTestCandidate} disabled={loading} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Create Test Candidate
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Quick Setup Guide:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Initialize Database" to create the required tables</li>
            <li>Click "Test N8N Endpoints" to verify webhook connectivity</li>
            <li>Click "Create Test Candidate" to test the full pipeline</li>
            <li>Check that all status indicators show "Ready"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
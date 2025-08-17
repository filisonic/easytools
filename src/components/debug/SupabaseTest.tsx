import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnonymousUserId } from '@/utils/uuid';

export function SupabaseTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log('Testing authentication...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('Auth response:', { user, error });
      
      setResult({
        operation: 'Check Authentication',
        success: !error,
        data: user ? { id: user.id, email: user.email, role: user.role } : null,
        error: error,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Auth test error:', err);
      setResult({
        operation: 'Check Authentication',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCandidatesRead = async () => {
    setLoading(true);
    try {
      console.log('Testing candidates table read...');
      const { data, error, count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact' });
      
      console.log('Raw Supabase response:', { data, error, count });
      
      setResult({
        operation: 'Read Candidates',
        success: !error,
        data: data,
        error: error,
        count: count,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Test error:', err);
      setResult({
        operation: 'Read Candidates',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCandidatesRLS = async () => {
    setLoading(true);
    try {
      console.log('Testing candidates with detailed RLS analysis...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Test 1: Normal query (what we see)
      const normalQuery = await supabase
        .from('candidates')
        .select('id, first_name, last_name, created_by, status, created_at');
      
      // Test 2: Count query (total in DB)
      const countQuery = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });
      
      // Test 3: Check user role
      const roleQuery = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id || '');
      
      console.log('Detailed RLS results:', { 
        normalQuery,
        countQuery, 
        roleQuery,
        currentUserId: user?.id 
      });
      
      setResult({
        operation: 'Detailed RLS Analysis',
        success: true,
        data: {
          currentUserId: user?.id,
          userRole: roleQuery.data?.[0]?.role || 'no role found',
          candidatesVisible: normalQuery.data || [],
          candidatesVisibleCount: normalQuery.data?.length || 0,
          totalCandidatesInDB: countQuery.count || 0,
          rlsIsBlocking: (countQuery.count || 0) > (normalQuery.data?.length || 0),
          normalQueryError: normalQuery.error,
          countQueryError: countQuery.error,
          roleQueryError: roleQuery.error
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('RLS test error:', err);
      setResult({
        operation: 'Detailed RLS Analysis',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testJobsRead = async () => {
    setLoading(true);
    try {
      console.log('Testing jobs table read...');
      const { data, error, count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact' });
      
      console.log('Raw jobs response:', { data, error, count });
      
      setResult({
        operation: 'Read Jobs',
        success: !error,
        data: data,
        error: error,
        count: count,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Jobs test error:', err);
      setResult({
        operation: 'Read Jobs',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateCandidate = async () => {
    setLoading(true);
    try {
      console.log('Testing candidate creation...');
      
      // Get current user or generate a valid UUID
      const { data: { user } } = await supabase.auth.getUser();
      const createdBy = user?.id || getAnonymousUserId();
      
      const testCandidate = {
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '555-0123',
        position: 'Test Position',
        status: 'active', // Try different status values
        created_by: createdBy
      };

      const { data, error } = await supabase
        .from('candidates')
        .insert(testCandidate)
        .select()
        .single();
      
      console.log('Create response:', { data, error });
      
      setResult({
        operation: 'Create Candidate',
        success: !error,
        data: data,
        error: error,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Create test error:', err);
      setResult({
        operation: 'Create Candidate',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testStatusValues = async () => {
    setLoading(true);
    try {
      console.log('Testing different status values...');
      
      // Get current user or generate a valid UUID
      const { data: { user } } = await supabase.auth.getUser();
      const createdBy = user?.id || getAnonymousUserId();
      
      const statusesToTest = ['active', 'inactive', 'placed', 'applied', 'pending', 'approved', 'rejected'];
      const results = [];
      
      for (const status of statusesToTest) {
        const testCandidate = {
          first_name: 'StatusTest',
          last_name: `${status}`,
          email: `status-test-${status}-${Date.now()}@example.com`,
          phone: '555-0123',
          position: 'Status Test Position',
          status: status,
          created_by: createdBy
        };

        const { data, error } = await supabase
          .from('candidates')
          .insert(testCandidate)
          .select()
          .single();
        
        results.push({
          status: status,
          success: !error,
          error: error?.message,
          data: data?.id || null
        });
        
        console.log(`Status '${status}':`, error ? 'FAILED' : 'SUCCESS');
      }
      
      setResult({
        operation: 'Test Status Values',
        success: true,
        data: {
          results: results,
          validStatuses: results.filter(r => r.success).map(r => r.status),
          invalidStatuses: results.filter(r => !r.success).map(r => ({ status: r.status, error: r.error }))
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Status test error:', err);
      setResult({
        operation: 'Test Status Values',
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Supabase Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAuth} disabled={loading}>
            Test Auth
          </Button>
          <Button onClick={testCandidatesRead} disabled={loading}>
            Test Read Candidates
          </Button>
          <Button onClick={testCandidatesRLS} disabled={loading}>
            Test RLS Analysis
          </Button>
          <Button onClick={testJobsRead} disabled={loading}>
            Test Read Jobs
          </Button>
          <Button onClick={testCreateCandidate} disabled={loading}>
            Test Create Candidate
          </Button>
          <Button onClick={testStatusValues} disabled={loading}>
            Test Status Values
          </Button>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h4 className="font-bold mb-2">RLS Issue Solution</h4>
          <p className="text-sm mb-2">
            If RLS is blocking candidates, you need to update the Supabase RLS policy.
            Go to Supabase Dashboard → Authentication → Policies → candidates table
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold">Show RLS Policy Fix</summary>
            <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto">
{`-- Policy to allow authenticated users to see all candidates
CREATE POLICY "Allow authenticated users to read all candidates"
ON candidates FOR SELECT
USING (auth.role() = 'authenticated');

-- Or if you want admins only:
CREATE POLICY "Allow admin users to read all candidates"  
ON candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'recruiter')
  )
);`}
            </pre>
          </details>
        </div>

        {loading && <div>Testing...</div>}

        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Test Result: {result.operation}</h3>
            <p className="mb-2">
              <strong>Success:</strong> {result.success ? '✅' : '❌'}
            </p>
            <p className="mb-2">
              <strong>Timestamp:</strong> {result.timestamp}
            </p>
            {result.count !== undefined && (
              <p className="mb-2">
                <strong>Count:</strong> {result.count}
              </p>
            )}
            {result.error && (
              <div className="mb-2">
                <strong>Error:</strong>
                <pre className="bg-red-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
            {result.data && (
              <div>
                <strong>Data:</strong>
                <pre className="bg-green-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
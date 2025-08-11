import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import JobsList from '../components/jobs/jobs-list';
import CreateJobForm from '../components/jobs/create-job-form';

const Jobs: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleJobCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (showCreateForm) {
    return (
      <PageLayout title="Create Job">
        <CreateJobForm 
          onSuccess={handleJobCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Jobs">
      <JobsList key={refreshKey} onCreateNew={() => setShowCreateForm(true)} />
    </PageLayout>
  );
};

export default Jobs;
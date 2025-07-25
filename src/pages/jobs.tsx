import React, { useState } from 'react';
import JobsList from '../components/jobs/jobs-list';
import CreateJobForm from '../components/jobs/create-job-form';
import { PageLayout } from '../components/layout/PageLayout';

const JobsPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');

  const handleCreateNew = () => {
    setView('create');
  };

  const handleCancelCreate = () => {
    setView('list');
  };

  const handleJobCreated = () => {
    setView('list');
  };

  return (
    <PageLayout title="Jobs">
      {view === 'list' ? (
        <JobsList onCreateNew={handleCreateNew} />
      ) : (
        <CreateJobForm onCancel={handleCancelCreate} onSuccess={handleJobCreated} />
      )}
    </PageLayout>
  );
};

export default JobsPage;

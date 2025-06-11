
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { JobList } from '@/components/jobs/JobList';

const Jobs = () => {
  return (
    <PageLayout title="Jobs">
      <JobList />
    </PageLayout>
  );
};

export default Jobs;

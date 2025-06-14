
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { JobApplicationForm } from '@/components/jobs/JobApplicationForm';

const Apply = () => {
  return (
    <PageLayout title="Apply for Position">
      <JobApplicationForm />
    </PageLayout>
  );
};

export default Apply;

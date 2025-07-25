
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Pipeline } from '@/components/ats/Pipeline';

const PipelinePage = () => {
  return (
    <PageLayout title="ATS Pipeline">
      <Pipeline />
    </PageLayout>
  );
};

export default PipelinePage;

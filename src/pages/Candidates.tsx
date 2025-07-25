
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CandidateList } from '@/components/candidates/CandidateList';

const Candidates = () => {
  return (
    <PageLayout title="Candidates">
      <CandidateList />
    </PageLayout>
  );
};

export default Candidates;

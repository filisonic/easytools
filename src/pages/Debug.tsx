import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DatabaseInitializer } from '@/components/debug/DatabaseInitializer';

export default function Debug() {
  return (
    <PageLayout title="System Debug">
      <div className="space-y-6">
        <DatabaseInitializer />
      </div>
    </PageLayout>
  );
}
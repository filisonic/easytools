
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { UserManagement } from '@/components/admin/UserManagement';

const Settings = () => {
  return (
    <PageLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage system settings and users</p>
        </div>
        
        <UserManagement />
      </div>
    </PageLayout>
  );
};

export default Settings;

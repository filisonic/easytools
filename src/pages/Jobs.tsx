
import React, { useState } from 'react';
import JobsList from '../components/jobs/JobsList';
import CreateJobForm from '../components/jobs/CreateJobForm';

const JobsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleJobCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of jobs list
  };

  if (showCreateForm) {
    return (
      <CreateJobForm 
        onSuccess={handleJobCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <JobsList key={refreshKey} onCreateNew={() => setShowCreateForm(true)} />
    </div>
  );
};

export default JobsPage;

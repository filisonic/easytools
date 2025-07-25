
import React from 'react';
import { JobApplicationForm } from '@/components/jobs/JobApplicationForm';

const Apply = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Job Application
          </h1>
          <p className="text-gray-600">
            Join our team! Complete your application below.
          </p>
        </div>
        <JobApplicationForm />
      </div>
    </div>
  );
};

export default Apply;

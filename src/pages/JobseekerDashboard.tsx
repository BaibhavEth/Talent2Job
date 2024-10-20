import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  resume?: string;
}

const JobseekerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);

      const formData = new FormData();
      formData.append('resume', file);
      try {
        const response = await axios.post('/api/jobseeker/upload-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        alert('Resume uploaded successfully!');
        fetchUserProfile(); // Refresh user profile after upload
      } catch (error) {
        console.error('Failed to upload resume:', error);
        alert('Failed to upload resume. Please try again.');
      }
    }
  };

  const handlePreviewResume = () => {
    if (user && user.resume) {
      window.open(user.resume, '_blank');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Jobseeker Dashboard</h2>
      {user && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Welcome, {user.name}</h3>
          <p>Email: {user.email}</p>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">
          {user?.resume ? 'Update Resume' : 'Upload Resume'}
        </h3>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {user?.resume && (
          <div className="mt-4">
            <button
              onClick={handlePreviewResume}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Preview Resume
            </button>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Available Jobs</h3>
        <ul className="space-y-4">
          {jobs.map((job: any) => (
            <li key={job._id} className="bg-white p-4 rounded shadow">
              <h4 className="font-bold">{job.title}</h4>
              <p className="text-gray-600">{job.company}</p>
              <p className="mt-2">{job.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default JobseekerDashboard;

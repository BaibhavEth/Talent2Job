import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployerDashboard: React.FC = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      const response = await axios.get('/api/employer/job-postings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setJobPostings(response.data);
    } catch (error) {
      console.error('Failed to fetch job postings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/employer/create-job', newJob, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Job posted successfully!');
      setNewJob({ title: '', description: '' });
      fetchJobPostings();
    } catch (error) {
      console.error('Failed to post job:', error);
      alert('Failed to post job. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Employer Dashboard</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Post a New Job</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newJob.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
              rows={4}
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Post Job
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Your Job Postings</h3>
        <ul className="space-y-4">
          {jobPostings.map((job: any) => (
            <li key={job._id} className="bg-white p-4 rounded shadow">
              <h4 className="font-bold">{job.title}</h4>
              <p className="mt-2">{job.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployerDashboard;
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to JobConnect</h1>
      <p className="text-xl mb-8">Connecting Jobseekers and Employers</p>
      <div className="space-x-4">
        <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Get Started
        </Link>
        <Link to="/login" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
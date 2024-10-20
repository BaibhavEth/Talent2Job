import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Briefcase />
          <span>JobConnect</span>
        </Link>
        <div className="space-x-4">
          <Link to="/login" className="hover:text-blue-200">Login</Link>
          <Link to="/register" className="hover:text-blue-200">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
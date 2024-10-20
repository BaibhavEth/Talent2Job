import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobseekerDashboard from './pages/JobseekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobseeker-dashboard" element={<JobseekerDashboard />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
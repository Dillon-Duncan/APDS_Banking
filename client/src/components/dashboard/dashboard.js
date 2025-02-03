import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import '../../styles/dashboard.css';

const Dashboard = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          navigate('/user/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/user/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message);
      }
    };

    fetchUserProfile();
  }, [navigate, setIsAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/user/login', { replace: true });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Banking Portal</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
      
      <div className="dashboard-content">
        {user.role === 'admin' ? (
          <AdminDashboard user={user} token={localStorage.getItem('token')} />
        ) : (
          <CustomerDashboard user={user} token={localStorage.getItem('token')} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
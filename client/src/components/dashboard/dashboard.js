import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import '../../styles/theme.css';

const Dashboard = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          console.error('Profile fetch failed:', response.status);
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/user/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }

        const userData = JSON.parse(responseText);
        console.log('Profile fetched successfully:', userData);
        setUser(userData);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching user:', error);
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      abortController.abort();
    };
  }, [navigate, setIsAuthenticated]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="dashboard-container">
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
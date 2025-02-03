import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/theme.css';
import './login.css';

const Login = ({ setIsAuthenticated }) => {
  console.log('Login component initialized');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    account_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (formData.username === 'Admin') {
      setIsAdmin(true);
      setFormData(prev => ({ ...prev, account_number: '' }));
    } else {
      setIsAdmin(false);
    }
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name}`);
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting login form:', { ...formData, password: '****' });

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login response:', { ...data, token: data.token ? 'exists' : 'none' });

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsAuthenticated(true);
            console.log('Login successful, navigating to dashboard');
            
            navigate('/dashboard', { replace: true });
        } else {
            console.error('Login failed:', data.message);
            setError(data.message || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'Failed to connect to server');
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="form-title">Login</h1>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  className="form-input"
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {!isAdmin && (
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label" htmlFor="account_number">Account Number</label>
                  <input
                    className="form-input"
                    type="text"
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={formData.account_number}
                    onChange={handleChange}
                    required={!isAdmin}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
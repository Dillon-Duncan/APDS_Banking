import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/theme.css';
import { NAME_REGEX, ACCOUNT_REGEX } from '../../utils/validations';
import { sanitizeInput } from '../../utils/sanitize';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    account_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (formData.username.toLowerCase() === 'admin') {
      setIsAdmin(true);
      setFormData(prev => ({ ...prev, account_number: '' }));
    } else {
      setIsAdmin(false);
    }
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: sanitizeInput(e.target.username.value),
          password: e.target.password.value
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.startsWith('<!DOCTYPE html>')) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message);
        } catch {
          throw new Error(errorText);
        }
      }

      const data = await response.json();
      console.log('Login response:', { ...data, token: data.token ? 'exists' : 'none' });

      if (data.token) {
        localStorage.setItem('token', data.token);
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
    <div className="centered-container">
      <div className="form-container centered-content">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="dashboard-heading">Login</h1>
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
                  onBlur={(e) => {
                    if(!NAME_REGEX.test(e.target.value)) {
                      setError('Username must be 2-50 letters');
                    }
                  }}
                  pattern="[A-Za-zÀ-ÿ' \-]{2,50}"
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
                    onBlur={(e) => {
                      if(!ACCOUNT_REGEX.test(e.target.value)) {
                        setError('Account number must be 10-20 alphanumeric');
                      }
                    }}
                    pattern="[A-Za-z0-9]{10,20}"
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
              minLength="8"
              onKeyPress={(e) => {
                if(e.key !== 'Backspace' && !/^[\x20-\x7E]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData('text');
                if(paste.length > 100) {
                  e.preventDefault();
                }
              }}
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
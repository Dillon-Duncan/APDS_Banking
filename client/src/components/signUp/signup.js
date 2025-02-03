import React, { useState, useEffect } from 'react';
import '../../styles/theme.css';
import { useNavigate } from 'react-router-dom';
import { 
  NAME_REGEX, 
  ACCOUNT_REGEX,
  PASSWORD_REGEX 
} from '../../utils/validations';

const Signup = () => {
    useEffect(() => {
        console.log('Signup component mounted');
        return () => {
            console.log('Signup component unmounted');
        };
    }, []);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        id_number: '',
        account_number: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input field "${name}" changed`);
        setFormData({
            ...formData,
            [name]: value
        });
        console.log('Updated form data:', { 
            ...formData, 
            [name]: name === 'password' ? '****' : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sanitizedData = {
                ...formData,
                first_name: formData.first_name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, ''),
                last_name: formData.last_name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, ''),
                account_number: formData.account_number.replace(/[^A-Z0-9]/gi, '')
            };

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sanitizedData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }
            
            await response.json();
            navigate('/user/login');
        } catch (error) {
            setError(error.message || 'Failed to connect to server');
        }
    };

    return (
        <div className="centered-container">
            <div className="form-container centered-content">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h1 className="dashboard-heading">Sign Up</h1>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label className="form-label" htmlFor="first_name">First Name</label>
                                <input className="form-input" type="text" id="first_name" name="first_name" placeholder="Enter first name" value={formData.first_name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="id_number">ID Number</label>
                                <input className="form-input" type="text" id="id_number" name="id_number" placeholder="Enter ID Number" value={formData.id_number} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">Username</label>
                                <input className="form-input" type="text" id="username" name="username" placeholder="Choose a username" value={formData.username} onChange={handleInputChange} required />
                            </div>
                        </div>
                        
                        <div className="form-column">
                            <div className="form-group">
                                <label className="form-label" htmlFor="last_name">Last Name</label>
                                <input className="form-input" type="text" id="last_name" name="last_name" placeholder="Enter last name" value={formData.last_name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="account_number">Account Number</label>
                                <input className="form-input" type="text" id="account_number" name="account_number" placeholder="Enter account number" value={formData.account_number} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if(e.key !== 'Backspace' && (e.key.length > 1 || !/^[\x00-\x7F]$/.test(e.key))) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if(!PASSWORD_REGEX.test(e.target.value)) {
                                            setError('Password requires 8+ chars with letters and numbers');
                                        }
                                    }}
                                    minLength="8"
                                    maxLength="100"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
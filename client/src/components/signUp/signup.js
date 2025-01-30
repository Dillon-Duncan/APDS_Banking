import React, { useState } from 'react';
import './signUp.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        lastName: '',
        idNumber: '',
        accountNumber: '',
        username: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        console.log(`Updated ${name}:`, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log(data);
            if (data.user && data.user._id) {
                navigate('/login');
            } else {
                console.log("User data is missing in the response:", data);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setFormData({
                first_name: '',
                last_name: '',
                id_number: '',
                account_number: '',
                username: '',
                password: ''
            });
        }
    };

    return (
        <div className="center-form">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h1>Sign Up</h1>
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input type="text" id="first_name" name="first_name" placeholder="Enter first name" value={formData.first_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input type="text" id="last_name" name="last_name" placeholder="Enter last name" value={formData.last_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="id_number">ID Number</label>
                    <input type="text" id="id_number" name="id_number" placeholder="Enter ID Number" value={formData.id_number} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="account_number">Account Number</label>
                    <input type="text" id="account_number" name="account_number" placeholder="Enter account number" value={formData.account_number} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="Enter username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="submit-button">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;
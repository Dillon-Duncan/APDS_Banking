import React, { useEffect } from 'react';
import '../../styles/theme.css';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        console.log('Header component mounted');
        return () => {
            console.log('Header component unmounted');
        };
    }, []);

    const handleLogout = () => {
        console.log('Starting logout process');
        try {
            // Clear all authentication-related items from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Clear any other app-specific storage
            localStorage.clear();
            
            console.log('All storage cleared');

            // Optional: Call logout endpoint if you have one
            const logoutAPI = async () => {
                try {
                    const response = await fetch('http://localhost:5000/user/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Logout API response:', response.status);
                } catch (error) {
                    console.error('Logout API error:', error);
                }
            };

            logoutAPI();
            
            // Force reload all application state
            console.log('Navigating to home page');
            navigate('/');
            
            // Optional: Reload the page to clear any remaining state
            window.location.reload();
            
            console.log('Logout completed successfully');
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if there's an error, try to navigate home
            navigate('/');
        }
    };

    return (
        <Navbar bg={token ? "primary" : "dark"} variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    {token ? "Banking System" : "Welcome"}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {token ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/user/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/user/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
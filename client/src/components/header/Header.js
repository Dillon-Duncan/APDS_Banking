import React, { useEffect } from 'react';
import '../../styles/theme.css';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
        window.location.reload();
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
import './styles/theme.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/login/login';
import Signup from './components/signUp/signup';
import Dashboard from './components/dashboard/dashboard';
import Header from './components/header/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/user/login" replace />
          } 
        />
        
        <Route 
          path="/user/login" 
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route 
          path="/user/register" 
          element={<Signup />}
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/user/login" replace />
            )
          } 
        />
      </Routes>
    </>
  );
}

export default App;

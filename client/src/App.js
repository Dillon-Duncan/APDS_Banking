import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/login';
import Signup from './components/signUp/signup';
import Dashboard from './components/dashboard/dashboard';

function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </>
  );
}

export default App;

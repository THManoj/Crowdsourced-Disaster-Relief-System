// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [userData, setUserData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath;
  const selectedDisaster = location.state?.selectedDisaster;

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3001/auth/login', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('isLoggedIn', 'true');
        
        if (returnPath) {
          navigate(returnPath, { state: { selectedDisaster } });
        } else {
          navigate('/');
        }
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Login</h1>
      <form onSubmit={handleLogin} className="p-4 shadow rounded">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={userData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={userData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={handleCreateAccount}
        >
          Create New Account
        </button>
      </form>
    </div>
  );
};

export default Login;

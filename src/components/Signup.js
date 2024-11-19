//src/components/Signup.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import { getNames } from 'country-list'; // Import from country-list package
import 'react-phone-input-2/lib/style.css';

const Signup = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  // Use country-list package to get countries
  useEffect(() => {
    const countryNames = getNames();
    const countryOptions = countryNames.map(country => ({
      label: country,
      value: country
    }));
    setCountries(countryOptions);
  }, []);

  // Handle country change
  const handleCountryChange = (selectedOption) => {
    setUserData({
      ...userData,
      country: selectedOption ? selectedOption.value : ''
    });
  };

  // Handle city input change with character limit
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    if (cityName.length <= 64) {
      setUserData({ ...userData, city: cityName });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/auth/signup', {
        username: userData.username,
        email: userData.email,
        phone_number: userData.phone,
        country: userData.country,
        city: userData.city,
        password: userData.password
      });
  
      if (response.status === 201) {
        alert('Registration successful!');
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Create Account</h1>
      <form onSubmit={handleSubmit} className="p-4 shadow rounded">
        
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            placeholder="Choose a username"
            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email <span style={{ color: 'red' }}>*</span></label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Enter your email"
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
          <PhoneInput
            country={'us'}
            value={userData.phone}
            onChange={(phone) => setUserData({ ...userData, phone })}
            inputProps={{
              name: 'phone',
              required: true,
              className: 'form-control',
            }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="country" className="form-label">Country <span style={{ color: 'red' }}>*</span></label>
          <Select
            id="country"
            name="country"
            options={countries}
            value={countries.find(option => option.value === userData.country)}
            onChange={handleCountryChange}
            placeholder="Select your country"
            isClearable
            required
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="city" className="form-label">City <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            className="form-control"
            id="city"
            name="city"
            value={userData.city}
            onChange={handleCityChange}
            placeholder="Enter your city (max 64 characters)"
            maxLength="64"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password <span style={{ color: 'red' }}>*</span></label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Choose a password"
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password <span style={{ color: 'red' }}>*</span></label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Create Account</button>
      </form>
    </div>
  );
};

export default Signup;

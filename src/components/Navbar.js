// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa'; // Install react-icons: npm install react-icons

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Disaster Management</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/disaster-reports">Disaster Reports</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ongoing-disasters">Ongoing Disasters</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/relief-camps">Relief Camps</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sos-alerts">SOS Alerts</Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            {isLoggedIn ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                  <FaUser /> Profile
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={`/profile/${userId}`}>My Profile</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to={`/profile/${userId}/donations`}>Donation History</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

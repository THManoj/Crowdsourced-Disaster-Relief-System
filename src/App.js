import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Optional, if you have a Navbar
import Home from './components/Home';
import DisasterReports from './components/DisasterReports';
import ReliefCamps from './components/ReliefCamps';
import OngoingDisasters from './components/OngoingDisasters';
import PaymentPage from './components/PaymentPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Donations from './components/Donations';
import UserProfile from './components/UserProfile';
import UserDonations from './components/UserDonations';
import SOSAlerts from './components/SOSAlerts';

function App() {
  return (
    <Router>
      <Navbar /> {/* Optional, if you want to have a consistent navbar */}
      <div className="container">
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Home />} />

          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Disaster routes */}
          <Route path="/disaster-reports" element={<DisasterReports />} />
          <Route path="/ongoing-disasters" element={<OngoingDisasters />} />
          
          {/* Donation routes */}
          <Route path="/donations" element={<Donations />} />
          <Route path="/payment" element={<PaymentPage />} />
          
          {/* Profile routes */}
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/profile/:id/donations" element={<UserDonations />} />
          
          {/* Relief camp routes */}
          <Route path="/relief-camps" element={<ReliefCamps />} />

          {/* SOS Alerts route */}
          <Route path="/sos-alerts" element={<SOSAlerts />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;

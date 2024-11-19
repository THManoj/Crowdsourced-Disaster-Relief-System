import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const disaster = location.state?.disaster;
  const userId = localStorage.getItem('userId');
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: '',
  });

  const handleInputChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      // Submit both donation and payment in one request
      const response = await axios.post('http://localhost:3001/api/submitdonations', {
        donor_id: userId,
        disaster_id: disaster.value,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method
      });

      if (response.status === 201) {
        alert('Payment completed successfully!');
        navigate(`/profile/${userId}/donations`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Donate to {disaster?.label}</h2>
      <form onSubmit={handlePayment} className="p-4 shadow rounded">
        <div className="mb-3">
          <label className="form-label">Donation Amount:</label>
          <input
            type="number"
            className="form-control"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            required
            min="1"
            step="0.01"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Payment Method:</label>
          <select
            className="form-control"
            name="payment_method"
            value={paymentData.payment_method}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Complete Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
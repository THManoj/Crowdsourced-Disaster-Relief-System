import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserDonations = () => {
  const [donations, setDonations] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchUserDonations = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/payments/${id}`);
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching user donations:', error);
      }
    };

    fetchUserDonations();
  }, [id]);

  return (
    <div className="container mt-4">
      <h2>Your Donation History</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Disaster Type</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.payment_id}>
                <td>{new Date(donation.payment_date).toLocaleString()}</td>
                <td>${parseFloat(donation.amount).toFixed(2)}</td>
                <td>{donation.payment_method}</td>
                <td>{donation.disaster_type}</td>
                <td>{donation.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDonations;
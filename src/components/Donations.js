import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Donations = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchAllDonations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getDonationDetails');
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };

    fetchAllDonations();
  }, []);

  return (
    <div className="container mt-4">
      <h2>All Donations</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Donor ID</th>
              <th>Amount</th>
              <th>Resource Donated</th>
              <th>Date</th>
              <th>Disaster Location</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.donation_id}>
                <td>{donation.donation_id}</td>
                <td>{donation.donor_id}</td>
                <td>${donation.amount.toFixed(2)}</td>
                <td>{donation.resource_donated || 'N/A'}</td>
                <td>{new Date(donation.date).toLocaleDateString()}</td>
                <td>{donation.location}</td>
                <td>{donation.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Donations;
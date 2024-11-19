import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/profile/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>User Profile</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{user.username}</h5>
          <p className="card-text">Email: {user.email}</p>
          <p className="card-text">Phone: {user.phone_number}</p>
          <p className="card-text">Country: {user.country}</p>
          <p className="card-text">City: {user.city}</p>
          <p className="card-text">Role: {user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
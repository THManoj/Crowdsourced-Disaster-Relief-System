import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';

const OngoingDisasters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/disasters');
        setDisasters(response.data);
        
        if (location.state?.selectedDisaster) {
          setSelectedDisaster(location.state.selectedDisaster);
        }
      } catch (error) {
        console.error('Error fetching disasters:', error);
      }
    };

    fetchDisasters();
  }, [location.state]);

  const handleDonate = () => {
    if (!selectedDisaster) {
      alert('Please select a disaster first');
      return;
    }

    if (!isLoggedIn) {
      alert('Please login to donate');
      navigate('/auth/login', { 
        state: { 
          returnPath: '/ongoing-disasters',
          selectedDisaster: selectedDisaster
        }
      });
      return;
    }

    navigate('/payment', { state: { disaster: selectedDisaster } });
  };

  const disasterOptions = disasters.map(disaster => ({
    value: disaster.disaster_id,
    label: `${disaster.disaster_type} - ${disaster.location}`,
    ...disaster
  }));

  return (
    <div className="container mt-4">
      <h1>Ongoing Disasters</h1>
      <div className="disasters-list mb-4">
        {disasters.map((disaster) => (
          <div key={disaster.disaster_id} className="card mb-3">
            <div className="card-body">
              <h2 className="card-title">{disaster.disaster_type}</h2>
              <p><strong>Location:</strong> {disaster.location}</p>
              <p><strong>Description:</strong> {disaster.description}</p>
              <p><strong>Severity Level:</strong> {
                  disaster.severity_level === 1 ? 'Low' :
                  disaster.severity_level === 2 ? 'Medium' :
                  disaster.severity_level === 3 ? 'High' : 'Unknown'
              }</p>
            </div>
          </div>
        ))}
      </div>

      <div className="donation-section d-flex align-items-center gap-3">
        <Select
          className="flex-grow-1"
          options={disasterOptions}
          value={selectedDisaster}
          onChange={(option) => setSelectedDisaster(option)}
          placeholder="Select a disaster to donate"
        />
        <button 
          className="btn btn-primary"
          onClick={handleDonate}
        >
          Donate
        </button>
      </div>
    </div>
  );
};

export default OngoingDisasters;

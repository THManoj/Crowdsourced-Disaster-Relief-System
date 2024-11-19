import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const ReliefCamps = () => {
  const [camps, setCamps] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'Admin';
  const [form, setForm] = useState({
    camp_name: '',
    location: '',
    capacity: ''
  });
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    fetchCamps();
    fetchDisasters();
  }, []);

  const fetchCamps = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/relief-camps');
      setCamps(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching relief camps:', error);
      setIsLoading(false);
    }
  };

  const fetchDisasters = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/disasters');
      setDisasters(response.data);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please login to create a relief camp');
      return;
    }

    if (!selectedDisaster) {
      alert('Please select a disaster');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/relief-camps', {
        ...form,
        disaster_id: selectedDisaster.value,
        location: selectedDisaster.location // Use disaster location
      });

      if (response.status === 201) {
        alert('Relief camp created successfully!');
        setForm({ camp_name: '', location: '', capacity: '' });
        setSelectedDisaster(null);
        fetchCamps();
      }
    } catch (error) {
      console.error('Error creating relief camp:', error);
      alert('Failed to create relief camp');
    }
  };

  const handleDelete = async (campId) => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'Admin') {
      alert('Access denied. Only admin can delete relief camps.');
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this camp?')) {
      return;
    }
  
    try {
      await axios.delete(`http://localhost:3001/api/relief-camps/${campId}`, {
        headers: { 'user-role': userRole }
      });
      alert('Camp deleted successfully!');
      fetchCamps();
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Access denied. Only admin can delete relief camps.');
      } else {
        console.error('Error deleting camp:', error);
        alert('Failed to delete camp');
      }
    }
  };

  const disasterOptions = disasters.map(disaster => ({
    value: disaster.disaster_id,
    label: `${disaster.disaster_type} - ${disaster.location}`,
    location: disaster.location
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Relief Camps</h2>

      {isLoggedIn && (
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="card-title">Create New Relief Camp</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Select Disaster:</label>
                <Select
                  options={disasterOptions}
                  value={selectedDisaster}
                  onChange={setSelectedDisaster}
                  placeholder="Select a disaster"
                  isClearable
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Camp Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="camp_name"
                  value={form.camp_name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Capacity:</label>
                <input
                  type="number"
                  className="form-control"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Camp</button>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {camps.map((camp) => (
          <div key={camp.camp_id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">{camp.camp_name}</h4>
                <p><strong>Location:</strong> {camp.location}</p>
                <p><strong>Capacity:</strong> {camp.capacity}</p>
                <p><strong>Disaster Type:</strong> {camp.disaster_type}</p>
                {isAdmin && (
                  <div className="mt-3">
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(camp.camp_id)}
                    >
                      Delete Camp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReliefCamps;

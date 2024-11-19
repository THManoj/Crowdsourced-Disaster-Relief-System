import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DisasterReports = () => {
  const [reports, setReports] = useState([]);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'Admin'; // Check admin role
  const [isEditing, setIsEditing] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [form, setForm] = useState({
    disaster_type: '',
    location: '',
    severity_level: '',
    description: ''
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const url = isAdmin ? 
          'http://localhost:3001/api/disasters' : 
          `http://localhost:3001/api/disasters/user/${userId}`;
        const response = await axios.get(url);
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, [userId, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!localStorage.getItem('isLoggedIn')) {
      alert('Please login to submit a disaster report');
      navigate('/auth/login', { state: { returnPath: '/disaster-reports' } });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/submit-disaster', {
        ...form,
        user_id: localStorage.getItem('userId'),
        severity_level: parseInt(form.severity_level)
      });

      if (response.status === 201) {
        alert('Disaster report submitted successfully!');
        const updatedReports = await axios.get('http://localhost:3001/api/disasters');
        setReports(updatedReports.data);
        setForm({
          disaster_type: '',
          location: '',
          severity_level: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setIsEditing(true);
    setForm({
      disaster_type: report.disaster_type,
      location: report.location,
      severity_level: report.severity_level.toString(),
      description: report.description
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/disasters/${editingReport.disaster_id}`,
        form,
        {
          headers: { 'user-role': userRole }
        }
      );

      if (response.status === 200) {
        alert('Disaster report updated successfully!');
        setIsEditing(false);
        setEditingReport(null);
        const updatedReports = await axios.get('http://localhost:3001/api/disasters');
        setReports(updatedReports.data);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  const handleDelete = async (reportId) => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'Admin') {
      alert('Access denied. Only admin can delete disasters.');
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
  
    try {
      await axios.delete(`http://localhost:3001/api/disasters/${reportId}`, {
        headers: { 'user-role': userRole }
      });
      const updatedReports = await axios.get('http://localhost:3001/api/disasters');
      setReports(updatedReports.data);
      alert('Report deleted successfully!');
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Access denied. Only admin can delete disasters.');
      } else {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Disaster Reports</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title mb-3">Submit New Report</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Disaster Type:</label>
              <input
                type="text"
                className="form-control"
                name="disaster_type"
                value={form.disaster_type}
                onChange={handleInputChange}
                required
                maxLength={50}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Location:</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                required
                maxLength={100}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Severity Level:</label>
              <select
                className="form-control"
                name="severity_level"
                value={form.severity_level}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Severity</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Description:</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit Report</button>
          </form>
        </div>
      </div>

      <h2 className="mb-3">My Reports</h2>
      <div className="row">
        {reports.map((report) => (
          <div key={report.disaster_id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">{report.disaster_type}</h3>
                <p><strong>Location:</strong> {report.location}</p>
                <p><strong>Severity Level:</strong> {
                  report.severity_level === 1 ? 'Low' :
                  report.severity_level === 2 ? 'Medium' : 'High'
                }</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p className="text-muted">
                  Reported at: {new Date(report.reported_at).toLocaleString()}
                </p>
                {isAdmin && ( // Show admin controls
                  <div className="mt-3">
                    <button 
                      className="btn btn-warning me-2"
                      onClick={() => handleEdit(report)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(report.disaster_id)}
                    >
                      Delete
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

export default DisasterReports;

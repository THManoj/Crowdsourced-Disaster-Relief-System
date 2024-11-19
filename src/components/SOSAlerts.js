import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SOSAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    fetchSOSAlerts();
  }, []);

  const fetchSOSAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sos-alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!isAdmin) {
      alert('Only admin can delete alerts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/sos-alerts/${alertId}`, {
        headers: { 'user-role': userRole }
      });
      fetchSOSAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Failed to delete alert');
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    if (!isAdmin) {
      alert('Only admin can update alert status');
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/sos-alerts/${alertId}`, {
        status: newStatus
      }, {
        headers: { 'user-role': userRole }
      });
      fetchSOSAlerts();
    } catch (error) {
      console.error('Error updating alert status:', error);
      alert('Failed to update alert status');
    }
  };

  return (
    <div className="container mt-4">
      <h2>SOS Alerts</h2>
      <div className="row">
        {alerts.map((alert) => (
          <div key={alert.alert_id} className="col-md-6 mb-3">
            <div className={`card ${alert.status === 'Resolved' ? 'bg-light' : 'border-danger'}`}>
              <div className="card-body">
                <h4 className="card-title">Alert #{alert.alert_id}</h4>
                <p><strong>Message:</strong> {alert.message}</p>
                <p><strong>Location:</strong> {alert.location}</p>
                <p><strong>Disaster Type:</strong> {alert.disaster_type}</p>
                <p><strong>Status:</strong> {alert.status}</p>
                <p className="text-muted">Sent at: {new Date(alert.sent_at).toLocaleString()}</p>
                {isAdmin && (
                  <div className="mt-3">
                    <select 
                      className="form-select mb-2"
                      value={alert.status}
                      onChange={(e) => handleStatusChange(alert.alert_id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteAlert(alert.alert_id)}
                    >
                      Delete Alert
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

export default SOSAlerts;
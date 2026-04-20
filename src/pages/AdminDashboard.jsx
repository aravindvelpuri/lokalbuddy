import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, MapPin, Phone, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';
import { API_URL } from '../constants';


const AdminDashboard = ({ onBack }) => {
  const [unverified, setUnverified] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchUnverified();
  }, []);

  const fetchUnverified = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/unverified-list`);
      const data = await response.json();
      if (data.success) {
        setUnverified(data.skilledLabours);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/approve-unverified/${id}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("Profile approved and moved!");
        setUnverified(unverified.filter(p => p._id !== id));
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg("Error approving profile");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this profile?")) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/reject-unverified/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("Profile rejected and removed");
        setUnverified(unverified.filter(p => p._id !== id));
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg("Error rejecting profile");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <button onClick={onBack} className="back-btn-dashboard">
          <ArrowLeft size={20} /> Back to Site
        </button>
        <div className="admin-title-row">
          <ShieldCheck className="admin-icon" size={32} />
          <div>
            <h1>Admin Verification Center</h1>
            <p>Review and approve new skilled professional registrations</p>
          </div>
        </div>
        <button onClick={fetchUnverified} className="refresh-btn" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </header>

      {successMsg && <div className="toast success-toast">{successMsg}</div>}
      {errorMsg && <div className="toast error-toast">{errorMsg}</div>}

      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <RefreshCw className="spin" size={48} />
            <p>Fetching pending registrations...</p>
          </div>
        ) : unverified.length === 0 ? (
          <div className="no-pending-box">
            <CheckCircle size={64} color="#10b981" />
            <h2>All Caught Up!</h2>
            <p>There are no pending registrations to review at this time.</p>
          </div>
        ) : (
          <div className="unverified-table-container">
            <table className="unverified-table">
              <thead>
                <tr>
                  <th>Professional</th>
                  <th>Skill Category</th>
                  <th>Location</th>
                  <th>Mobile Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unverified.map((person) => (
                  <tr key={person._id}>
                    <td>
                      <div className="td-user">
                        <div className="avatar-sm">
                          <User size={16} />
                        </div>
                        <span>{person.FullName}</span>
                      </div>
                    </td>
                    <td><span className="skill-tag-pill">{person.SelectSkill}</span></td>
                    <td>
                      <div className="td-flex">
                        <MapPin size={14} /> {person.Location}
                      </div>
                    </td>
                    <td>
                      <div className="td-flex">
                        <Phone size={14} /> {person.MobileNumber}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-approve" 
                          onClick={() => handleApprove(person._id)}
                          disabled={actionLoading === person._id}
                        >
                          <CheckCircle size={18} /> Approve
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => handleReject(person._id)}
                          disabled={actionLoading === person._id}
                        >
                          <XCircle size={18} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

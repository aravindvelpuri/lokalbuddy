import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import AlertModal from './AlertModal';
import './BaseModal.css';
import { API_URL } from '../constants';


const ChangePasswordModal = ({ isOpen, onClose, userId, userRole }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setAlertContent({ title: 'Error', message: 'New passwords do not match!' });
      setShowAlert(true);
      return;
    }
    if (formData.newPassword.length < 5) {
      setAlertContent({ title: 'Error', message: 'Password must be at least 5 characters long.' });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: userId,
          role: userRole,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAlertContent({ title: 'Success', message: 'Password changed successfully!' });
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
          onClose(); 
        }, 1500);
      } else {
        setAlertContent({ title: 'Error', message: result.message || 'Failed to change password' });
        setShowAlert(true);
      }
    } catch (err) {
      setAlertContent({ title: 'Error', message: 'Network error. Try again.' });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-primary)' }}>Change Password</h3>
          <button type="button" className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
              <input 
                type="password" 
                name="oldPassword"
                className="modal-input"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}/>
              <input 
                type="password" 
                name="newPassword"
                className="modal-input"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}/>
              <input 
                type="password" 
                name="confirmPassword"
                className="modal-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="button button-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <AlertModal isOpen={showAlert} onClose={() => setShowAlert(false)} title={alertContent.title} message={alertContent.message} />
    </>
  );
};

export default ChangePasswordModal;

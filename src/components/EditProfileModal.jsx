import React, { useState, useEffect } from 'react';
import { X, MapPin, User, FileText } from 'lucide-react';
import LocationPickerModal from './LocationPickerModal';
import AlertModal from './AlertModal';
import './BaseModal.css';
import { API_URL } from '../constants';


const EditProfileModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    FullName: '',
    Location: '',
    Description: ''
  });
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const isProfessional = initialData?.role === 'Professional';

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        FullName: initialData.FullName || '',
        Location: initialData.Location || '',
        Description: initialData.Description || ''
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (address) => {
    setFormData({ ...formData, Location: address });
    setShowLocationPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/lokal-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: initialData._id,
          role: initialData.role,
          ...formData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAlertContent({ title: 'Success', message: 'Profile updated successfully!' });
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          onSaveSuccess(result.user);
          onClose(); // Automatically close Edit Modal
        }, 1500);
      } else {
        setAlertContent({ title: 'Error', message: result.message || 'Failed to update profile' });
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
      <div className="modal-content glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Edit Profile</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
              <input 
                type="text" 
                name="FullName"
                className="modal-input"
                value={formData.FullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Location</label>
            <div 
              onClick={() => setShowLocationPicker(true)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}/>
              <div style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '10px', border: '1.5px solid var(--primary)', background: 'rgba(225, 26, 91, 0.03)', color: 'var(--text-primary)', minHeight: '50px', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                {formData.Location || 'Tap to select location on map...'}
              </div>
            </div>
          </div>

          {isProfessional && (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Professional Bio</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }}/>
                <textarea 
                  name="Description"
                  className="modal-input"
                  value={formData.Description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your skills to attract customers..."
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="button button-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    {showLocationPicker && (
      <LocationPickerModal 
        isOpen={showLocationPicker} 
        onClose={() => setShowLocationPicker(false)} 
        onSelect={handleLocationSelect}
      />
    )}
    
    <AlertModal isOpen={showAlert} onClose={() => setShowAlert(false)} title={alertContent.title} message={alertContent.message} />
    </>
  );
};
export default EditProfileModal;

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './RegisterModal.css';
import { API_URL } from '../constants';


const RegisterModal = ({ isOpen, onClose, onLoginSuccess, initialRole = 'Professional' }) => {
  const [role, setRole] = useState(initialRole); // 'Professional' or 'Customer'
  const [formData, setFormData] = useState({
    FullName: '',
    MobileNumber: '',
    Location: '',
    SelectSkill: '',
    Description: '',
    customSkill: '',
    Occupation: '', // Added for Customer role compatibility
    Password: '',
  });
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available skills on mount
  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        try {
          const response = await fetch(`${API_URL}/available-skills`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setAvailableSkills(result.data.map(s => s.name));
            }
          }
        } catch (err) {
          console.error("Failed to fetch skills:", err);
        }
      };
      fetchSkills();
      
      // Reset state when modal opens
      setError('');
      setSuccess('');
      setRole(initialRole);
      setFormData({
        FullName: '',
        MobileNumber: '',
        Location: '',
        SelectSkill: '',
        Description: '',
        customSkill: '',
        Occupation: '',
        Password: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (role === 'Professional') {
        let finalSkill = formData.SelectSkill;
        // 1. If 'Other' is selected, register the new skill first
        if (formData.SelectSkill === 'Other') {
          if (!formData.customSkill.trim()) {
             setError("Please enter a custom skill name.");
             setLoading(false);
             return;
          }
          finalSkill = formData.customSkill.trim();
          
          // Basic normalization: capitalized first letter
          if (finalSkill) {
            finalSkill = finalSkill.charAt(0).toUpperCase() + finalSkill.slice(1);
          }
          
          await fetch(`${API_URL}/add-available-skill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: finalSkill })
          });
        }

        const payload = {
          FullName: formData.FullName,
          MobileNumber: formData.MobileNumber,
          Location: formData.Location,
          SelectSkill: finalSkill,
          Description: formData.Description,
          AddedBy: "Self_Registration",
          RegisteredBy: "Website",
        };

        const response = await fetch(`${API_URL}/register-unverified`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'Professional');
            localStorage.setItem('user', JSON.stringify({ ...data.user, role: 'Professional' }));
            onLoginSuccess({ ...data.user, role: 'Professional' });
          }
          onClose();
        } else {
          setError(data.message || 'Registration failed.');
        }
      } else {
        // Customer Registration
        const payload = {
          FullName: formData.FullName,
          MobileNumber: formData.MobileNumber,
          District: "LoKal Buddy", // Defaults for compatibility
          Contituency: "Community",
          Locations: formData.Location,
          Occupation: formData.Occupation || "Client",
          Password: formData.Password,
          RegisteredBY: "Website",
        };

        const response = await fetch(`${API_URL}/lokal-customer-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'Customer');
            localStorage.setItem('user', JSON.stringify({ ...data.user, role: 'Customer' }));
            onLoginSuccess({ ...data.user, role: 'Customer' });
          }
          setSuccess("Registration successful! Welcome to LoKal Buddy.");
          setTimeout(onClose, 2000);
        } else {
          setError(data.message || 'Registration failed.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-modal-overlay" onClick={onClose}>
      <div className="register-modal" onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2>{role === 'Professional' ? 'Join as a Pro' : 'Sign Up as a Client'}</h2>
        <p className="subtitle">
          {role === 'Professional' 
            ? 'Register to offer your skills to the local community.' 
            : 'Find and connect with top-rated local professionals.'}
        </p>

        <div className="role-selector">
          <button 
            type="button"
            className={`role-tab ${role === 'Professional' ? 'active' : ''}`}
            onClick={() => setRole('Professional')}
          >
            I want to work
          </button>
          <button 
            type="button"
            className={`role-tab ${role === 'Customer' ? 'active' : ''}`}
            onClick={() => setRole('Customer')}
          >
            I want to hire
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="FullName">Full Name</label>
            <input 
              type="text" 
              id="FullName" 
              name="FullName" 
              value={formData.FullName} 
              onChange={handleChange} 
              required 
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="MobileNumber">Mobile Number</label>
            <input 
              type="tel" 
              id="MobileNumber" 
              name="MobileNumber" 
              value={formData.MobileNumber} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 9876543210"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit mobile number."
            />
          </div>

          <div className="form-group">
            <label htmlFor="Password">Password</label>
            <input 
              type="password" 
              id="Password" 
              name="Password" 
              value={formData.Password} 
              onChange={handleChange} 
              required 
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="Location">Location</label>
            <input 
              type="text" 
              id="Location" 
              name="Location" 
              value={formData.Location} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Guntur, AP"
            />
          </div>

          {role === 'Professional' && (
            <>
              <div className="form-group">
                <label htmlFor="SelectSkill">Primary Skill</label>
                <select 
                  id="SelectSkill" 
                  name="SelectSkill" 
                  value={formData.SelectSkill} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>Select your skill</option>
                  {availableSkills.map((skill, idx) => (
                    <option key={idx} value={skill}>{skill}</option>
                  ))}
                  <option value="Other">Other / Create New</option>
                </select>
              </div>

              {formData.SelectSkill === 'Other' && (
                <div className="form-group">
                  <label htmlFor="customSkill">New Skill Name</label>
                  <input 
                    type="text" 
                    id="customSkill" 
                    name="customSkill" 
                    value={formData.customSkill} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Plumber"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="Description">Professional Bio / Description</label>
                <textarea 
                  id="Description" 
                  name="Description" 
                  value={formData.Description} 
                  onChange={handleChange} 
                  placeholder="Tell clients about your expertise, experience, and services..."
                  rows={3}
                />
              </div>
            </>
          )}

          {role === 'Customer' && (
            <div className="form-group">
              <label htmlFor="Occupation">Your Occupation (Optional)</label>
              <input 
                type="text" 
                id="Occupation" 
                name="Occupation" 
                value={formData.Occupation} 
                onChange={handleChange} 
                placeholder="e.g. Business Owner, Manager"
              />
            </div>
          )}

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;

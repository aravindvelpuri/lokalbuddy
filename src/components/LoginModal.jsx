import React, { useState } from 'react';
import { X } from 'lucide-react';
import './LoginModal.css';
import { API_URL } from '../constants';


const LoginModal = ({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) => {
  const [role, setRole] = useState('Professional'); // 'Professional' or 'Customer'
  const [formData, setFormData] = useState({
    MobileNumber: '',
    Password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = role === 'Professional' 
        ? `${API_URL}/skilllogin` 
        : `${API_URL}/lokal-customer-login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('user', JSON.stringify({ ...data.user, role }));
        
        onLoginSuccess({ ...data.user, role });
        onClose();
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your LoKal Buddy account</p>

        <div className="role-selector">
          <button 
            className={`role-tab ${role === 'Professional' ? 'active' : ''}`}
            onClick={() => setRole('Professional')}
          >
            I'm a Professional
          </button>
          <button 
            className={`role-tab ${role === 'Customer' ? 'active' : ''}`}
            onClick={() => setRole('Customer')}
          >
            I'm a Customer
          </button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-mobile">Mobile Number</label>
            <input
              type="tel"
              id="login-mobile"
              name="MobileNumber"
              value={formData.MobileNumber}
              onChange={handleChange}
              required
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              placeholder="Your password"
            />
          </div>

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <span onClick={onSwitchToRegister}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import './Pricing.css';
import { API_URL } from '../constants';


const Pricing = ({ onRegisterClick, user }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const confirmSubscription = async () => {
    setShowConfirm(false);
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    
    const userRole = user.role || localStorage.getItem('userRole');
    const endpoint = userRole === 'Professional' 
      ? `${API_URL}/subscribe-pro` 
      : `${API_URL}/subscribe`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ proId: user._id })
      });
      const result = await response.json();
      if (result.success) {
        setAlertContent({
          title: 'Success!',
          message: result.message || 'Subscription active!'
        });
        setShowAlert(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setAlertContent({ title: 'Error', message: result.message });
        setShowAlert(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="pricing" className="pricing">
      <div className="section-container">
        <h2 className="heading-title">Simple <span className="text-gradient">Pricing</span></h2>
        <p className="heading-subtitle">Transparent pricing for everyone on LoKal Buddy</p>

        <div className="pricing-grid">
          {/* Customers Card */}
          <div className="pricing-card glass-card">
            <h3 className="pricing-role">For Customers</h3>
            <div className="pricing-amount">
              <span className="currency">₹</span>
              <span className="price">499</span>
              <span className="period">/year</span>
            </div>
            <p className="pricing-desc">Access to our network of verified local service professionals.</p>
            
            <ul className="pricing-features">
              <li><Check className="feature-icon text-secondary" size={20} /> Search all services</li>
              <li><Check className="feature-icon text-secondary" size={20} /> View provider profiles</li>
              <li><Check className="feature-icon text-secondary" size={20} /> Contact <span className="highlight text-secondary">Verified</span> providers</li>
              <li><Check className="feature-icon text-secondary" size={20} /> Priority support</li>
            </ul>
            
            {!user ? (
              <button 
                className="button button-secondary w-full mt-auto"
                onClick={() => onRegisterClick('Customer')}
              >
                Choose Plan
              </button>
            ) : (
              <button 
                className="button button-secondary w-full mt-auto"
                onClick={() => setShowConfirm(true)}
              >
                Activate Subscription
              </button>
            )}
          </div>

          {/* Providers Card - Highlighted */}
          <div className="pricing-card glass-card premium-card">
            <div className="popular-badge">Most Popular</div>
            <h3 className="pricing-role">For Service Providers</h3>
            <div className="pricing-amount">
              <span className="currency">₹</span>
              <span className="price">499</span>
              <span className="period">/year</span>
            </div>
            <p className="pricing-desc">Get the verified badge and stand out to more customers.</p>
            
            <ul className="pricing-features">
              <li><Check className="feature-icon text-primary" size={20} /> Verified ✔️ Badge on profile</li>
              <li><Check className="feature-icon text-primary" size={20} /> Priority listing in search</li>
              <li><Check className="feature-icon text-primary" size={20} /> Higher visibility</li>
              <li><Check className="feature-icon text-primary" size={20} /> Direct customer inquiries</li>
              <li><X className="feature-icon text-danger" size={20} style={{color: '#ff4d4f'}} /> No hidden commissions</li>
            </ul>
            
            {!user ? (
              <button 
                className="button button-primary w-full mt-auto"
                onClick={() => onRegisterClick('Professional')}
              >
                Become Verified
              </button>
            ) : (
              <button 
                className="button button-primary w-full mt-auto"
                onClick={() => setShowConfirm(true)}
              >
                Activate Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSubscription}
        title="LoKal Buddy Subscription"
        message="Get unlimited access to all professional contacts and your Expert Verification Badge for 1 year at ₹499?"
        confirmText="Unlock Access"
      />

      <AlertModal 
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertContent.title}
        message={alertContent.message}
      />
    </section>
  );
};

export default Pricing;

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, ChevronLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import './Profile.css';
import { API_URL } from '../constants';


const Profile = ({ onBack }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const role = localStorage.getItem('userRole');

        if (!user || !user._id || user._id === 'undefined') {
          setError("User identity lost. Please sign in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/lokal-profile?id=${user._id}&role=${role}`, {
          headers: { 'token': token }
        });
        const result = await response.json();
        if (result.success) {
          setProfileData(result);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubscribe = async () => {
    setShowConfirm(true);
  };

  const confirmSubscription = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const user = JSON.parse(localStorage.getItem('user'));

      const endpoint = userRole === 'Professional' 
        ? `${API_URL}/subscribe-pro` 
        : `${API_URL}/subscribe`;

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
        setAlertContent({ title: 'Success!', message: 'Subscription activated! Your Expert Badge is now live.' });
        setShowAlert(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSave = (updatedUser) => {
    setProfileData(prev => ({
      ...prev,
      user: { ...prev.user, ...updatedUser }
    }));
    
    // Also update localStorage so refresh retains it (if it matches root fields)
    const currentLoc = JSON.parse(localStorage.getItem('user'));
    if (currentLoc) {
      localStorage.setItem('user', JSON.stringify({ ...currentLoc, ...updatedUser }));
    }
  };

  if (loading) return <div className="profile-loading">Loading your profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profileData) return <div className="profile-error">Failed to load profile. Please login again.</div>;

  const { user } = profileData;
  const isCustomer = localStorage.getItem('userRole') === 'Customer';
  const isSubscribed = user.SubscriptionExpiry && new Date(user.SubscriptionExpiry) > new Date();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-nav">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={20} /> Back to Hub
          </button>
        </div>

        <div className="profile-main-grid">
          {/* Left Column: User Card */}
          <div className="profile-left">
            <div className="user-card glass-card">
              <div className="user-avatar">
                <div className="avatar-inner">
                  <User size={48} />
                </div>
              </div>
              <div className="user-identity">
                <h2>{user.FullName}</h2>
                <p className="user-label">{isCustomer ? 'LoKal Buddy Member' : user.SelectSkill}</p>
                <div className="user-badges">
                  {isCustomer ? (
                    <span className={`status-badge ${isSubscribed ? 'active' : 'inactive'}`}>
                      {isSubscribed ? 'Premium Access' : 'Basic Member'}
                    </span>
                  ) : (
                    <span className={`status-badge ${user.isVerified ? 'active' : 'pending'}`}>
                      {user.isVerified ? 'Verified Expert' : 'Pending Approval'}
                    </span>
                  )}
                </div>
              </div>

              <div className="user-stats">
                <div className="stat">
                  <span className="stat-num">{isCustomer ? '0' : '4.9'}</span>
                  <span className="stat-text">{isCustomer ? 'Hires' : 'Rating'}</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{isCustomer ? '0' : '12'}</span>
                  <span className="stat-text">{isCustomer ? 'Favorites' : 'Jobs'}</span>
                </div>
              </div>

              <div className="user-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button className="button button-outline w-full" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
                <button 
                  className="button button-ghost w-full" 
                  onClick={() => setShowChangePassword(true)}
                  style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="contact-card glass-card">
              <h3>Contact Details</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <Phone size={18} />
                  <span>{user.MobileNumber}</span>
                </div>
                <div className="contact-item">
                  <MapPin size={18} />
                  <span>{user.Location || user.Locations || 'Add Location'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="profile-right">
            {isCustomer ? (
              <>
                <div className="subscription-card highlight-card glass-card">
                  <div className="card-header">
                    <h3>Subscription Status</h3>
                    <Briefcase size={24} className="icon-sub" />
                  </div>
                  <div className="subscription-content">
                    {isSubscribed ? (
                      <div className="sub-active">
                        <div className="sub-info">
                          <p className="expiry-label">Access Expires</p>
                          <h4 className="expiry-date">{new Date(user.SubscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                        </div>
                        <div className="sub-perks">
                          <p>✓ Unlimited professional contacts</p>
                          <p>✓ Direct call feature enabled</p>
                          <p>✓ Priority support</p>
                        </div>
                      </div>
                    ) : (
                      <div className="sub-inactive">
                        <p className="sub-promo">Upgrade to Premium to unlock all professional mobile numbers across the platform.</p>
                        <div className="pricing-mini">
                          <span className="currency">₹</span>
                          <span className="price">499</span>
                          <span className="period">/ year</span>
                        </div>
                        <button className="button button-primary sub-btn" onClick={handleSubscribe}>
                          Subscribe Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="activity-card glass-card">
                  <h3>Recent Activity</h3>
                  <div className="empty-activity">
                    <p>No connections yet. Start browsing to find experts!</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="professional-hub">
                <div className="subscription-card highlight-card glass-card">
                  <div className="card-header">
                    <h3>Expert Verification Badge</h3>
                    <ShieldCheck size={24} className="icon-sub" />
                  </div>
                  <div className="subscription-content">
                    {isSubscribed ? (
                      <div className="sub-active">
                        <div className="sub-info">
                          <p className="expiry-label">Badge Status: <span className="text-success">ACTIVE</span></p>
                          <h4 className="expiry-date">Verified until {new Date(user.SubscriptionExpiry).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h4>
                        </div>
                        <div className="sub-perks">
                          <p>✓ Show up as "EXPERT" in search</p>
                          <p>✓ Unlimited contact visibility</p>
                          <p>✓ Priority directory placement</p>
                        </div>
                      </div>
                    ) : (
                      <div className="sub-inactive">
                        <p className="sub-promo">Show your expertise! Get the **Verified EXPERT Badge** for ₹499/year and gain full access to the directory.</p>
                        <div className="pricing-mini">
                          <span className="currency">₹</span>
                          <span className="price">499</span>
                          <span className="period">/ year</span>
                        </div>
                        <button className="button button-primary sub-btn" onClick={handleSubscribe}>
                          Get Expert Badge
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bio-card glass-card mt-2">
                  <div className="card-header">
                    <h3>Professional Overview</h3>
                    <button className="icon-button" onClick={() => setShowEditProfile(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ExternalLink size={20} className="icon-edit" />
                    </button>
                  </div>
                  <div className="bio-content">
                    {user.Description ? (
                      <p className="bio-text">{user.Description}</p>
                    ) : (
                      <div className="empty-bio-prompt">
                        <p>Tell your future clients about your expertise, experience, and the quality of work you provide.</p>
                        <button className="add-bio-btn" onClick={() => setShowEditProfile(true)}>+ Add Bio</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSubscription}
        title="Upgrade to Expert"
        message="Get the Verified EXPERT Badge and unlimited access to all professional contacts for 1 year at ₹499?"
        confirmText="Unlock Expert Status"
      />

      <AlertModal 
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertContent.title}
        message={alertContent.message}
      />
      
      {profileData && user && (
        <EditProfileModal 
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          initialData={{ ...user, role: localStorage.getItem('userRole') }}
          onSaveSuccess={handleProfileSave}
        />
      )}

      {profileData && user && (
        <ChangePasswordModal 
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          userId={user._id}
          userRole={localStorage.getItem('userRole')}
        />
      )}
    </div>
  );
};

export default Profile;

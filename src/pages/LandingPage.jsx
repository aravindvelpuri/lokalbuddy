import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RegisterModal from '../components/RegisterModal';
import LoginModal from '../components/LoginModal';
import SuccessModal from '../components/SuccessModal';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Services from '../components/Services';
import Suppliers from '../components/Suppliers';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import ProfessionalsList from './ProfessionalsList';
import NearestProfessionals from '../components/NearestProfessionals';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import { API_URL } from '../constants';


const LandingPage = ({ view = 'home', selectedCategory, onAdminClick, onProfileClick, onCategoryClick, onBack }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('Professional');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ title: '', message: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error("Failed to parse saved user", err);
      }
    }
  }, []);

  // Fetch subscription profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/lokal-profile?id=${currentUser._id}&role=${currentUser.role}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            const hasActiveSub = data.user.SubscriptionExpiry && new Date(data.user.SubscriptionExpiry) > new Date();
            setIsSubscribed(hasActiveSub);
          }
        })
        .catch(err => console.error("Error fetching profile", err));
    } else {
      setIsSubscribed(false);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setSuccessInfo({
      title: 'Welcome!',
      message: `You have successfully signed in as ${user.FullName}.`
    });
    setIsSuccessModalOpen(true);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setSuccessInfo({
      title: 'Registration Successful!',
      message: 'Your account has been created and you are now signed in. Our team will contact you soon for approval.'
    });
    setIsSuccessModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const openLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openRegister = (role = 'Professional') => {
    setIsLoginModalOpen(false);
    setRegistrationRole(role);
    setIsRegisterModalOpen(true);
  };

  const handleSubscribe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertContent({
        title: 'Sign In Required',
        message: 'Please Sign In as a Customer or Professional to subscribe for full access.'
      });
      setShowAlert(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubscription = async () => {
    setShowConfirm(false);
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const user = JSON.parse(localStorage.getItem('user'));

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
        body: JSON.stringify({ proId: user?._id })
      });
      const result = await response.json();
      if (result.success) {
        setAlertContent({
          title: 'Success!',
          message: result.message || 'Subscription active! All contacts are now unlocked.'
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

  const handleConnect = (labour) => {
    if (labour.leadType === 'through_me') {
      setAlertContent({
        title: 'Enquiry Contact',
        message: `For enquiries regarding ${labour.FullName}, please contact: ${labour.AddedByName || 'Admin'} at ${labour.AddedBy || 'our support line'}.`
      });
      setShowAlert(true);
      return;
    }

    if (labour.isUnlocked) {
      window.location.href = `tel:${labour.MobileNumber}`;
    } else {
      handleSubscribe();
    }
  };

  return (
    <>
      <Navbar
        user={currentUser}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onSignInClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onAdminClick={onAdminClick}
        onProfileClick={onProfileClick}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={openRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginSuccess={handleRegisterSuccess}
        initialRole={registrationRole}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title={successInfo.title}
        message={successInfo.message}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {view === 'home' ? (
        <>
          <Hero onRegisterClick={openRegister} user={currentUser} />
          <NearestProfessionals 
            onConnect={handleConnect} 
            currentUser={currentUser} 
            onViewAll={() => onCategoryClick('All')} 
          />
          <Services key={`services-${currentUser?._id || 'guest'}`} onCategoryClick={onCategoryClick} />
          <Testimonials />
        </>
      ) : (
        <ProfessionalsList category={selectedCategory} onBack={onBack} />
      )}

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

      <Footer onRegisterClick={openRegister} user={currentUser} />
    </>
  );
};

export default LandingPage;


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
import { API_URL } from '../constants';


const LandingPage = ({ onAdminClick, onProfileClick }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('Professional');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ title: '', message: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);

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

      <Hero onRegisterClick={openRegister} user={currentUser} />
      <HowItWorks />
      {(!currentUser || !isSubscribed) && (
        <Pricing onRegisterClick={openRegister} user={currentUser} />
      )}
      <Services key={`services-${currentUser?._id || 'guest'}`} />
      <Suppliers key={`suppliers-${currentUser?._id || 'guest'}`} isSubscribed={isSubscribed} />
      <Testimonials />
      <Footer onRegisterClick={openRegister} user={currentUser} />
    </>
  );
};

export default LandingPage;


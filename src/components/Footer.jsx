import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = ({ onRegisterClick, user }) => {
  return (
    <footer className="footer">
      <div className="section-container footer-content">
        <div className="footer-brand">
          <div className="logo footer-logo">
            <img src="/logo.jpeg" alt="LoKal Buddy Logo" className="logo-image" style={{ height: '50px' }} />
          </div>
          <p className="footer-desc">
            Your trusted local platform to find verified service professionals. Get your tasks done effortlessly.
          </p>
          <div className="social-links">
            <a href="#facebook" className="social-icon"><FaFacebook size={20} /></a>
            <a href="#twitter" className="social-icon"><FaTwitter size={20} /></a>
            <a href="#instagram" className="social-icon"><FaInstagram size={20} /></a>
            <a href="#linkedin" className="social-icon"><FaLinkedin size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>For Users</h4>
          {!user && (
            <>
              <a href="#register" onClick={(e) => { e.preventDefault(); onRegisterClick('Customer'); }}>Customer Register</a>
              <a href="#provider" onClick={(e) => { e.preventDefault(); onRegisterClick('Professional'); }}>Become a Provider</a>
            </>
          )}
          <a href="#guidelines">Safety Guidelines</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-links-group">
          <h4>Platform</h4>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-cta">
          <h4>Join LoKal Buddy Today</h4>
          <p>Get started with finding trusted professionals near you.</p>
          {!user ? (
            <button
              className="button button-primary"
              onClick={() => onRegisterClick()}
            >
              Register Now
            </button>
          ) : (
            <p className="text-primary font-semibold mt-2">You are part of our community!</p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LoKal Buddy. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

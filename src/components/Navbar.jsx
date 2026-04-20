import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onRegisterClick, onSignInClick, user, onLogout, onAdminClick, onProfileClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo">
          <img src="/logo.jpeg" alt="LoKal Buddy Logo" className="logo-image" />
        </div>

        <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Browse Skills</a>
          <a href="#suppliers" onClick={() => setMobileMenuOpen(false)}>Suppliers</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          
          <div className="mobile-nav-actions" style={{ flexDirection: 'column', gap: '1rem', marginTop: '2rem', alignItems: 'center', width: '100%', padding: '0 2rem' }}>
            {user ? (
               <>
                  <span className="user-name" style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    <UserIcon size={18} style={{ marginRight: '0.5rem' }} />
                    Hi, {user.FullName.split(' ')[0]}
                  </span>
                  <button className="profile-link-btn" style={{ margin: 0, width: '100%' }} onClick={() => { onProfileClick(); setMobileMenuOpen(false); }}>Profile</button>
                  <button className="profile-link-btn" style={{ margin: 0, width: '100%', backgroundColor: '#ef4444' }} onClick={() => { onLogout(); setMobileMenuOpen(false); }}>Logout</button>
               </>
            ) : (
                <>
                  <button className="signin-link" onClick={() => { onSignInClick(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)' }}>Sign In</button>
                  <button className="button button-primary" onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }}>Join as Skilled User</button>
                </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
           {user ? (
            <div className="user-profile desktop-nav-actions">
              <span className="user-name">
                <UserIcon size={18} style={{ marginRight: '0.5rem' }} />
                Hi, {user.FullName.split(' ')[0]}
              </span>
              <button 
                className="profile-link-btn" 
                onClick={onProfileClick}
                title="My Profile"
              >
                Profile
              </button>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="desktop-nav-actions" style={{ alignItems: 'center' }}>
              <button 
                className="signin-link" 
                onClick={onSignInClick}
                style={{ background: 'none', border: 'none', marginRight: '1.5rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button className="button button-primary" onClick={onRegisterClick}>Join as Skilled User</button>
            </div>
          )}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


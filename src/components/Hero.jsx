import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import './Hero.css';

const Hero = ({ onRegisterClick, user }) => {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="gradient-blob blob-1"></div>
      </div>
      
      <div className="hero-content section-container animate-fade-in">
        <div className="hero-grid">
          <div className="hero-text-side">
            <h1 className="hero-title">
              Find Local Skills,<br/>
              <span className="text-primary">Anytime</span>
            </h1>
            <p className="hero-subtitle">
              Connect with skilled professionals in your area. From home repairs to tutoring, find the right person for any task, anytime you need them.
            </p>
            
            <div className="hero-actions">
              <button 
                className="button button-primary hero-btn"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Find Skills
              </button>
              {!user && (
                <button 
                  className="button button-outline hero-btn"
                  onClick={() => onRegisterClick('Professional')}
                >
                  Offer Your Skills
                </button>
              )}
            </div>
            
            <div className="hero-tags">
              <div className="hero-tag">
                <MapPin size={18} className="text-primary" />
                <span>Local Professionals</span>
              </div>
              <div className="hero-tag">
                <Clock size={18} className="text-primary" />
                <span>Available 24/7</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-side">
            <div className="hero-image-wrapper">
              <img src="/logo.jpeg" alt="LoKal Buddy Banner" className="hero-banner-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

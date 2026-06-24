import React from 'react';
import { Star, ShieldAlert, Award, ShieldCheck, Zap } from 'lucide-react';
import './Hero.css';

const Hero = ({ onRegisterClick, user }) => {
  const handleHeroAction = () => {
    if (user) {
      // If logged in, scroll to nearest professionals section
      const nearestSection = document.querySelector('.nearest-section');
      if (nearestSection) {
        nearestSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Trigger registration
      onRegisterClick();
    }
  };

  return (
    <section id="home" className="hero-redesigned">
      <div className="hero-container section-container">

        {/* Left Column: Hero Content */}
        <div className="hero-left animate-fade-in">
          <div className="trusted-badge">
            <ShieldCheck size={16} className="trusted-badge-icon" />
            <span>Trusted by 12K+ families</span>
          </div>

          <h1 className="hero-main-title">
            Instant Local Skills in<br />
            <span className="text-pink-highlight">Minutes</span>
          </h1>

          <p className="hero-description">
            Connect with trained & verified local experts for plumbing, electrical work, carpentry, tiling & more - instantly, whenever you need them.
          </p>

          <div className="feature-pills-row">
            <div className="feature-pill">
              <Star size={14} className="pill-icon" />
              <span>Top Rated Experts</span>
            </div>
            <div className="feature-pill">
              <ShieldCheck size={14} className="pill-icon" />
              <span>Thorough Background Check</span>
            </div>
            <div className="feature-pill">
              <Award size={14} className="pill-icon" />
              <span>Verified Expert Badges</span>
            </div>
          </div>

          <div className="hero-action-buttons">
            <button
              className="button hero-cta-btn"
              onClick={handleHeroAction}
            >
              {user ? 'Find Nearest Experts' : 'Join as Skilled Resource'}
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visuals */}
        <div className="hero-right animate-fade-in">
          <div className="hero-visual-card">
            {/* The model image generated */}
            <div className="hero-model-frame">
              <img src="/hero_expert.png" alt="Local Skill Professional" className="hero-model-img" />
            </div>

            {/* Floating Ratings Badge */}
            <div className="floating-badge-rating">
              <Star size={14} fill="var(--primary)" color="var(--primary)" />
              <span>4.8 Rated</span>
            </div>

            {/* Floating ETA Badge */}
            <div className="floating-badge-eta">
              <div className="eta-icon-wrapper">
                <Zap size={16} fill="white" color="white" />
              </div>
              <div className="eta-text-details">
                <p className="eta-title">Expert on the way</p>
                <p className="eta-subtitle">ETA: ~10 minutes</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-content section-container animate-fade-in">
        <h1 className="hero-title">
          Find Local Skills,<br />
          <span className="text-primary">Anytime</span>
        </h1>
        <p className="hero-subtitle">
          Connect with skilled professionals in your area. From home repairs to tutoring, find the right person for any task, anytime you need them.
        </p>
      </div>
    </section>
  );
};

export default Hero;

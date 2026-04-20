import React, { useState, useRef } from 'react';
import { Search, UserCheck, MessageCircle } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: <Search size={32} />,
    title: 'Search Services',
    description: 'Find the right professional for your needs from our extensive list of local services.',
    color: 'var(--primary)'
  },
  {
    icon: <UserCheck size={32} />,
    title: 'Choose Provider',
    description: 'Compare profiles and select between verified and unverified providers based on your budget.',
    color: 'var(--secondary)'
  },
  {
    icon: <MessageCircle size={32} />,
    title: 'Connect Instantly',
    description: 'Reach out to your chosen professional and get your work done quickly and efficiently.',
    color: 'var(--accent)'
  }
];

const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPosition = containerRef.current.scrollLeft;
      const cardWidth = containerRef.current.offsetWidth;
      const newIndex = Math.round(scrollPosition / cardWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToIndex = (index) => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="section-container">
        <h2 className="heading-title">How It <span className="text-gradient">Works</span></h2>
        <p className="heading-subtitle">Get your tasks done in three simple steps</p>
        
        <div 
          className="steps-container"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {steps.map((step, index) => (
            <div key={index} className="step-card glass-card">
              <div 
                className="step-icon-wrapper" 
                style={{ backgroundColor: `${step.color}20`, color: step.color }}
              >
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="step-connector"></div>
              )}
            </div>
          ))}
        </div>

        <div className="slider-indicators">
          {steps.map((_, idx) => (
            <button 
              key={idx}
              className={`indicator-dot ${activeIndex === idx ? 'active' : ''}`}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import React, { useState, useRef } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Raj S.',
    role: 'Customer',
    content: '"Found a verified plumber within minutes. The process was super smooth and the work was impeccable. Highly recommend LoKal Buddy."',
    avatar: 'RS'
  },
  {
    name: 'Priya K.',
    role: 'Tutor',
    content: '"Getting verified on LoKal Buddy completely transformed my tutoring business. I get regular queries now and building trust is so much easier."',
    avatar: 'PK'
  },
  {
    name: 'Anil M.',
    role: 'Customer',
    content: '"The platform is extremely user-friendly. Finding an electrician late at night was saving grace. The direct contact feature is the best part."',
    avatar: 'AM'
  }
];

const Testimonials = () => {
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
    <section id="testimonials" className="testimonials">
      <div className="section-container">
        <h2 className="heading-title">What People <span className="text-gradient">Say</span></h2>
        <p className="heading-subtitle">Join thousands of satisfied users on LoKal Buddy</p>
        
        <div 
          className="testimonials-grid"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card glass-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-content">{testimonial.content}</p>
              
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="slider-indicators">
          {testimonials.map((_, idx) => (
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

export default Testimonials;

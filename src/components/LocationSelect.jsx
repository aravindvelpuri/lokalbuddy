import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, X } from 'lucide-react';
import './LocationSelect.css';

const LocationSelect = ({ value, onChange, placeholder = 'Select Location', districts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Responsive Viewport Hook
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Prevent background scrolling when Mobile Bottom Sheet is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  // Smart Search Logic
  const filteredDistricts = districts.map(dist => {
    const matchesParliament = dist.parliament.toLowerCase().includes(searchQuery.toLowerCase());
    const matchingAssemblies = dist.assemblies.filter(assembly => 
      assembly.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchesParliament || matchingAssemblies.length > 0) {
      return {
        ...dist,
        assemblies: matchesParliament ? dist.assemblies : matchingAssemblies
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className={`location-select-container ${isOpen ? 'active' : ''}`} ref={wrapperRef}>
      {/* Trigger Button */}
      <button 
        type="button"
        className="location-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={18} className="trigger-icon" />
        <span className={`trigger-text ${!value ? 'placeholder' : ''}`}>
          {value || placeholder}
        </span>
      </button>

      {/* WEB DESKTOP DROPDOWN */}
      {!isMobile && isOpen && (
        <div className="location-select-dropdown animate-popover">
          <div className="dropdown-search-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dropdown-search-input"
            />
          </div>
          
          <div className="dropdown-options-list">
            {filteredDistricts.length === 0 ? (
              <div className="no-options">No locations found</div>
            ) : (
              filteredDistricts.map((dist) => (
                <div key={dist._id} className="dropdown-group">
                  <div 
                    className="dropdown-group-header"
                    onClick={() => handleSelect(dist.parliament)}
                  >
                    {dist.parliament} (Parliament)
                  </div>
                  <div className="dropdown-group-items">
                    {dist.assemblies.map((assembly) => (
                      <div 
                        key={assembly._id} 
                        className={`dropdown-item ${value === assembly.name ? 'selected' : ''}`}
                        onClick={() => handleSelect(assembly.name)}
                      >
                        {assembly.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET MODAL (PORTALED TO BODY) */}
      {isMobile && isOpen && createPortal(
        <>
          {/* Backdrop overlay */}
          <div className="bottom-sheet-backdrop" onClick={() => setIsOpen(false)} />
          
          {/* Bottom Sheet Sheet Container */}
          <div className="bottom-sheet-container">
            {/* Sheet Handle and Header */}
            <div className="bottom-sheet-header">
              <div className="bottom-sheet-drag-handle" />
              <div className="bottom-sheet-header-title">
                <h3>Select Location</h3>
                <button type="button" className="bottom-sheet-close" onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search Input wrapper */}
            <div className="bottom-sheet-search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search constituency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bottom-sheet-search-input"
              />
            </div>

            {/* Scrollable list */}
            <div className="bottom-sheet-content">
              {filteredDistricts.length === 0 ? (
                <div className="no-options">No locations found</div>
              ) : (
                filteredDistricts.map((dist) => (
                  <div key={dist._id} className="bottom-sheet-group">
                    <div 
                      className="bottom-sheet-group-header"
                      onClick={() => handleSelect(dist.parliament)}
                    >
                      {dist.parliament} (Parliament)
                    </div>
                    <div className="bottom-sheet-group-items">
                      {dist.assemblies.map((assembly) => (
                        <div 
                          key={assembly._id} 
                          className={`bottom-sheet-item ${value === assembly.name ? 'selected' : ''}`}
                          onClick={() => handleSelect(assembly.name)}
                        >
                          {assembly.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default LocationSelect;

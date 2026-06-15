import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, ChevronDown, MapPin, Search } from 'lucide-react';
import './Navbar.css';
import { API_URL } from '../constants';

const cleanCategories = (rawCategories) => {
  const normalized = rawCategories.map(cat => {
    if (!cat) return '';
    let name = cat.trim();
    
    const lower = name.toLowerCase();
    if (lower === 'test') return null;
    
    if (lower === 'carpenter' || lower === 'carpenters') return 'Carpenter';
    if (lower === 'mason' || lower === 'masons') return 'Mason';
    if (lower === 'plumber' || lower === 'plumbers') return 'Plumber';
    if (lower === 'painter' || lower === 'painters') return 'Painter';
    if (lower === 'tiler' || lower === 'tilers') return 'Tiler';
    if (lower === 'electrician' || lower === 'electricians') return 'Electrician';
    
    return name.charAt(0).toUpperCase() + name.slice(1);
  }).filter(Boolean);

  return [...new Set(normalized)].sort((a, b) => a.localeCompare(b));
};

const Navbar = ({ onRegisterClick, onSignInClick, user, onLogout, onAdminClick, onProfileClick, onCategoryClick, selectedCity, onCityClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'services' or 'cities' on mobile
  
  // Dynamic links list states
  const [dynamicSkills, setDynamicSkills] = useState([]);
  const [dynamicCities, setDynamicCities] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-item-dropdown')) {
        setActiveDropdown(null);
        setCitySearchQuery('');
        setServiceSearchQuery('');
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch Services & Cities dynamically from the Professionals section backend endpoints
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/available-skills`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const rawSkills = result.data.map(s => s.name);
            setDynamicSkills(cleanCategories(rawSkills));
          }
        }
      } catch (err) {
        console.error("Navbar failed to fetch services:", err);
      }
    };

    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/skillLabour', '/alldiscons/alldiscons')}`);
        if (response.ok) {
          const data = await response.json();
          const uniquePlaces = [];
          data.forEach(dist => {
            if (dist.parliament && !dist.parliament.includes('LoKal')) {
              uniquePlaces.push(dist.parliament);
            }
            dist.assemblies.forEach(assembly => {
              if (assembly.name && !assembly.name.includes('Community')) {
                uniquePlaces.push(assembly.name);
              }
            });
          });
          const uniqueSorted = [...new Set(uniquePlaces)].sort((a, b) => a.localeCompare(b));
          setDynamicCities(uniqueSorted);
        }
      } catch (err) {
        console.error("Navbar failed to fetch cities:", err);
      }
    };

    fetchServices();
    fetchCities();
  }, []);

  const handleDropdownToggle = (type) => {
    if (window.innerWidth >= 992) return;
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(type);
    }
    setCitySearchQuery('');
    setServiceSearchQuery('');
  };

  // Fallback defaults if APIs are loading or fail
  const displaySkills = dynamicSkills.length > 0 ? dynamicSkills : ['Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Tiler'];
  const displayCities = dynamicCities.length > 0 ? dynamicCities : ['Patna Sahib', 'Gaya', 'Muzaffarpur', 'Bhagalpur'];

  const filteredCities = displayCities.filter(city => 
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const filteredSkills = displaySkills.filter(skill => 
    skill.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src="/logo.jpeg" alt="LoKal Buddy Logo" className="logo-image" />
        </div>

        <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {/* Services Dropdown */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'services' ? 'active' : ''}`}
            onMouseLeave={(e) => {
              if (window.innerWidth >= 992) {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setServiceSearchQuery('');
                }
              }
            }}
            onBlur={(e) => {
              if (window.innerWidth >= 992 && (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget))) {
                setServiceSearchQuery('');
              }
            }}
          >
            <span className="nav-link-with-arrow" onClick={() => handleDropdownToggle('services')}>
              Services <ChevronDown size={14} className="dropdown-arrow-icon" />
            </span>
            <div className="dropdown-menu-card services-dropdown-menu">
              <div className="services-search-wrapper">
                <Search size={14} className="services-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search service..." 
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {serviceSearchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setServiceSearchQuery('');
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} className="services-clear-icon" />
                  </button>
                )}
              </div>
              <div className="services-list-scroll">
                {filteredSkills.map(skill => (
                  <a 
                    key={skill} 
                    href={`/professionals?category=${encodeURIComponent(skill)}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Navbar: Clicked skill link:", skill);
                      if (onCategoryClick) {
                        onCategoryClick(skill);
                      } else {
                        console.error("Navbar: onCategoryClick is undefined!");
                      }
                      setMobileMenuOpen(false);
                      setActiveDropdown(null);
                      setServiceSearchQuery('');
                      e.currentTarget.blur();
                    }}
                  >
                    {skill}
                  </a>
                ))}
                {filteredSkills.length === 0 && (
                  <span className="no-services-found">No services found</span>
                )}
              </div>
            </div>
          </div>

          {/* Cities Dropdown */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'cities' ? 'active' : ''}`}
            onMouseLeave={(e) => {
              if (window.innerWidth >= 992) {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setCitySearchQuery('');
                }
              }
            }}
            onBlur={(e) => {
              if (window.innerWidth >= 992 && (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget))) {
                setCitySearchQuery('');
              }
            }}
          >
            <span className="nav-link-with-arrow" onClick={() => handleDropdownToggle('cities')}>
              <MapPin size={14} className="city-pin-icon" style={{ marginRight: '4px', opacity: 0.8 }} />
              {selectedCity || 'Cities'} <ChevronDown size={14} className="dropdown-arrow-icon" />
            </span>
            <div className="dropdown-menu-card cities-dropdown-menu">
              <div className="cities-search-wrapper">
                <Search size={14} className="cities-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search city..." 
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {citySearchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCitySearchQuery('');
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} className="cities-clear-icon" />
                  </button>
                )}
              </div>
              <div className="cities-list-scroll">
                {filteredCities.map(city => (
                  <a 
                    key={city} 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Navbar: Clicked city link:", city);
                      if (onCityClick) {
                        onCityClick(city);
                      }
                      setMobileMenuOpen(false);
                      setActiveDropdown(null);
                      setCitySearchQuery('');
                      e.currentTarget.blur();
                    }}
                  >
                    {city}
                  </a>
                ))}
                {filteredCities.length === 0 && (
                  <span className="no-cities-found">No cities found</span>
                )}
              </div>
            </div>
          </div>

          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>FAQ</a>

          <div className="mobile-nav-actions">
            {user ? (
              <>
                <span className="user-name" style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <UserIcon size={18} style={{ marginRight: '0.5rem' }} />
                  Hi, {user.FullName.split(' ')[0]}
                </span>
                <button className="profile-link-btn" style={{ margin: 0, width: '100%' }} onClick={() => { onProfileClick(); setMobileMenuOpen(false); }}>Profile</button>
                <button className="profile-link-btn" style={{ margin: '0.5rem 0 0 0', width: '100%', backgroundColor: '#ef4444' }} onClick={() => { onLogout(); setMobileMenuOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <button className="signin-link" onClick={() => { onSignInClick(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Sign In</button>
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
                style={{ background: 'none', border: 'none', marginRight: '1.5rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
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

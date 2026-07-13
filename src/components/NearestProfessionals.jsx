import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  User,
  ShieldCheck,
  Lock,
  Phone,
  RefreshCw,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import LocationSelect from './LocationSelect';
import './NearestProfessionals.css';
import { API_URL } from '../constants';

const NearestProfessionals = ({ onConnect, currentUser, onViewAll, selectedCity, onCityChange }) => {
  const [labours, setLabours] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync selectedCity prop to lokal locationQuery state
  useEffect(() => {
    if (selectedCity !== undefined) {
      setLocationQuery(selectedCity);
    }
  }, [selectedCity]);

  // Geolocation and auto-detection states
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');

  // 1. Fetch constituencies (districts) on mount
  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/skillLabour', '/alldiscons/alldiscons')}`);
        if (response.ok) {
          const data = await response.json();
          setDistricts(data);
        }
      } catch (err) {
        console.error("Failed to fetch constituencies:", err);
      }
    };
    fetchConstituencies();
  }, []);

  // 2. Geolocation detection logic
  const detectLocation = React.useCallback((isAuto = false) => {
    if (!('geolocation' in navigator)) {
      if (!isAuto) alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setDetectedCity('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addressInfo = data.address;
              // Extract names to match
              const placeNames = [
                addressInfo.city,
                addressInfo.town,
                addressInfo.village,
                addressInfo.suburb,
                addressInfo.county,
                addressInfo.state_district
              ].filter(Boolean).map(name => name.toLowerCase().trim());

              if (placeNames.length > 0) {
                const displayPlace = addressInfo.city || addressInfo.town || addressInfo.village || placeNames[0];
                setDetectedCity(displayPlace);

                // Look for matches in the districts list
                let matchedConstituency = '';
                for (const dist of districts) {
                  const isParlMatch = placeNames.some(pName =>
                    dist.parliament.toLowerCase().includes(pName) || pName.includes(dist.parliament.toLowerCase())
                  );

                  if (isParlMatch) {
                    matchedConstituency = dist.parliament;
                    break;
                  }

                  const matchingAssembly = dist.assemblies.find(assembly =>
                    placeNames.some(pName =>
                      assembly.name.toLowerCase().includes(pName) || pName.includes(assembly.name.toLowerCase())
                    )
                  );

                  if (matchingAssembly) {
                    matchedConstituency = matchingAssembly.name;
                    break;
                  }
                }

                if (matchedConstituency) {
                  setLocationQuery(matchedConstituency);
                  if (onCityChange) {
                    onCityChange(matchedConstituency);
                  }
                } else if (!isAuto) {
                  alert(`Detected: "${displayPlace}". No exact matching Bihar constituency found. Please select from the dropdown.`);
                }
              }
            }
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsDetecting(false);
        if (!isAuto) {
          alert("Could not detect location automatically. Please select it manually.");
        }
      },
      { timeout: 8000 } // 8 seconds timeout to prevent getting stuck in "Detecting..."
    );
  }, [districts]);

  // 3. Trigger auto-detection on mount (once districts are loaded)
  useEffect(() => {
    if (districts.length > 0) {
      const savedUser = localStorage.getItem('user');
      let userLoc = '';
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          userLoc = parsed.Location || parsed.Locations;
        } catch (e) {
          console.error(e);
        }
      }

      if (userLoc) {
        setLocationQuery(userLoc);
      } else {
        // Auto detect location automatically on mount
        detectLocation(true);
      }
    }
  }, [districts, detectLocation]);

  // 4. Fetch professionals with debounce when query or location changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProfessionals();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, locationQuery]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page: 1,
        limit: 50, // Fetch more to allow one-skill-one-person filtering
      });

      if (searchQuery) queryParams.append('search', searchQuery);
      if (locationQuery) queryParams.append('location', locationQuery);

      const response = await fetch(`${API_URL}/unified-list?${queryParams.toString()}`, {
        headers: token ? { 'token': token } : {}
      });

      if (response.ok) {
        const result = await response.json();
        const allLabours = result.data || [];

        // Apply "One Skill, One Person" filter
        const filtered = [];
        const seenSkills = new Set();
        for (const pro of allLabours) {
          // Normalize skill name to avoid duplicate categories due to whitespace/case differences
          const skill = pro.SelectSkill ? pro.SelectSkill.trim().toLowerCase() : '';
          if (skill && !seenSkills.has(skill)) {
            seenSkills.add(skill);
            filtered.push(pro);
          }
        }

        setLabours(filtered.slice(0, 6)); // Display top 6 unique skills
      } else {
        setError('Failed to fetch professionals.');
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplicitDetect = () => {
    detectLocation(false);
  };

  const renderSkeleton = () => (
    <div className="nearest-card skeleton-card" style={{ animation: 'pulse 1.5s infinite', opacity: 0.7 }}>
      <div className="skeleton-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-border)', margin: '0.5rem auto 1.25rem' }}></div>
      <div style={{ height: '20px', width: '60%', background: 'var(--surface-border)', margin: '0 auto 0.5rem', borderRadius: '4px' }}></div>
      <div style={{ height: '16px', width: '40%', background: 'var(--surface-border)', margin: '0 auto 0.8rem', borderRadius: '4px' }}></div>
      <div style={{ height: '14px', width: '70%', background: 'var(--surface-border)', margin: '0 auto 1.5rem', borderRadius: '4px' }}></div>
      <div style={{ height: '40px', width: '100%', background: 'var(--surface-border)', borderRadius: '12px', marginTop: 'auto' }}></div>
    </div>
  );

  return (
    <section className="nearest-section">
      <div className="nearest-container">
        <h2 className="heading-title">
          Find <span className="text-primary">Nearest Professionals</span>
        </h2>
        <p className="heading-subtitle">Locate verified experts closest to your home</p>

        {/* Filter and Search Bar */}
        <div className="filter-bar-glass">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-color" />
            <input
              type="text"
              placeholder="Search by name, skill, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <LocationSelect
            value={locationQuery}
            onChange={(val) => {
              setLocationQuery(val);
              if (onCityChange) {
                onCityChange(val);
              }
            }}
            placeholder="Select location / constituency"
            districts={districts}
          />

          <button
            type="button"
            className="locate-btn"
            onClick={handleExplicitDetect}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <RefreshCw size={18} className="spin-loader" /> Detecting...
              </>
            ) : (
              <>
                <Navigation size={18} /> Detect Location
              </>
            )}
          </button>
        </div>

        {/* Status indicator */}
        {locationQuery && (
          <div className="status-pill-info">
            <MapPin size={14} /> Showing professionals in <strong>{locationQuery}</strong>
            {detectedCity && ` (Nearest to ${detectedCity})`}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-center" style={{ color: 'red', margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Professionals Grid */}
        <div className="nearest-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)
          ) : labours.length === 0 ? (
            <div className="empty-nearest">
              <Search size={40} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h4>No professionals found</h4>
              <p>Try clearing your filters or selecting a different constituency.</p>
            </div>
          ) : (
            labours.map((labour, index) => (
              <div key={labour._id || index} className="nearest-card">
                <div className="card-top-tag">
                  {labour.isVerified ? (
                    <span className="card-top-tag-verified">
                      <ShieldCheck size={12} /> EXPERT
                    </span>
                  ) : (
                    <span className="card-top-tag-community">
                      COMMUNITY
                    </span>
                  )}
                </div>

                <div className="card-pro-avatar">
                  <User size={32} />
                </div>

                <h3 className="card-pro-name">{labour.FullName}</h3>
                <span className="card-pro-skill">{labour.SelectSkill}</span>

                <div className="card-pro-location">
                  <MapPin size={14} className="text-primary" /> {labour.Location}
                </div>

                <div className="pro-phone" style={{ marginBottom: '1rem' }}>
                  <Phone size={14} />
                  {labour.leadType === 'through_me' ? (
                    <span className="phone-masked" style={{ fontSize: '0.9rem' }}>
                      Contact for Enquiry
                    </span>
                  ) : (
                    <>
                      <span className={labour.isUnlocked ? 'phone-visible' : 'phone-masked'} style={{ fontSize: '0.9rem' }}>
                        {labour.MobileNumber}
                      </span>
                      {!labour.isUnlocked && <Lock size={12} className="lock-icon" />}
                    </>
                  )}
                </div>

                {labour.Description && (
                  <p className="card-pro-desc">{labour.Description}</p>
                )}

                {labour.leadType === 'through_me' ? (
                  <button
                    className="button card-pro-contact-btn button-primary"
                    onClick={() => onConnect(labour)}
                  >
                    Enquiry Now
                  </button>
                ) : (
                  <button
                    className={`button card-pro-contact-btn ${labour.isUnlocked ? 'button-outline' : 'button-primary'}`}
                    onClick={() => onConnect(labour)}
                  >
                    {labour.isUnlocked ? 'Call Now' : 'Annual Access (₹499)'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        {!loading && labours.length > 0 && (
          <div className="view-all-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              className="button button-outline"
              onClick={onViewAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2.5rem', fontWeight: '700' }}
            >
              View All Professionals <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearestProfessionals;

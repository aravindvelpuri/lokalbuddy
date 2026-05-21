import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, ShieldCheck, Lock, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import '../components/Services.css';
import { API_URL } from '../constants';
import LocationSelect from '../components/LocationSelect';

const ProfessionalsList = ({ category, onBack }) => {
  const [labours, setLabours] = useState([]);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const handleSubscribe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertContent({
        title: 'Sign In Required',
        message: 'Please Sign In as a Customer or Professional to subscribe for full access.'
      });
      setShowAlert(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubscription = async () => {
    setShowConfirm(false);
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const user = JSON.parse(localStorage.getItem('user'));

    const endpoint = userRole === 'Professional'
      ? `${API_URL}/subscribe-pro`
      : `${API_URL}/subscribe`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ proId: user?._id })
      });
      const result = await response.json();
      if (result.success) {
        setAlertContent({
          title: 'Success!',
          message: result.message || 'Subscription active! All contacts are now unlocked.'
        });
        setShowAlert(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setAlertContent({ title: 'Error', message: result.message });
        setShowAlert(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = (labour) => {
    if (labour.leadType === 'through_me') {
      setAlertContent({
        title: 'Enquiry Contact',
        message: `For enquiries regarding ${labour.FullName}, please contact: ${labour.AddedByName || 'Admin'} at ${labour.AddedBy || 'our support line'}.`
      });
      setShowAlert(true);
      return;
    }

    if (labour.isUnlocked) {
      window.location.href = `tel:${labour.MobileNumber}`;
    } else {
      handleSubscribe();
    }
  };

  const fetchData = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 12,
      });

      if (searchQuery) queryParams.append('search', searchQuery);
      if (locationQuery) queryParams.append('location', locationQuery);
      if (category && category !== 'All') queryParams.append('category', category);

      // Fetch paginated labours
      const labResponse = await fetch(`${API_URL}/unified-list?${queryParams.toString()}`, {
        headers: token ? { 'token': token } : {}
      });
      const labResult = await labResponse.json();

      const fetchedLabours = labResult.data || [];

      if (append) {
        setLabours(prev => [...prev, ...fetchedLabours]);
      } else {
        setLabours(fetchedLabours);
      }

      setTotalPages(labResult.totalPages || 1);

    } catch (err) {
      setError('Could not connect to the backend server.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Debounced Search & Filter Effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchData(1, false);
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, locationQuery, category]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  };

  // Render a skeleton loading card
  const renderSkeleton = () => (
    <div className="pro-card glass-card skeleton-card" style={{ animation: 'pulse 1.5s infinite', opacity: 0.7 }}>
      <div className="skeleton-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-border)', margin: '0 auto 1rem' }}></div>
      <div style={{ height: '20px', width: '60%', background: 'var(--surface-border)', margin: '0 auto 0.5rem', borderRadius: '4px' }}></div>
      <div style={{ height: '16px', width: '80%', background: 'var(--surface-border)', margin: '0 auto 1.5rem', borderRadius: '4px' }}></div>
      <div style={{ height: '40px', width: '100%', background: 'var(--surface-border)', borderRadius: '8px', marginTop: 'auto' }}></div>
    </div>
  );

  return (
    <div className="page-container" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
      <section className="services" style={{ background: 'transparent' }}>
        <div className="section-container">
          <button
            className="button button-outline"
            onClick={onBack}
            style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h2 className="heading-title">
            <span className="text-primary">{category && category !== 'All' ? category : 'All'}</span> Professionals
          </h2>
          <p className="heading-subtitle">Find the best {category && category !== 'All' ? category : 'experts'} near you</p>

          {/* Search & Filters */}
          <div className="search-filters glass-card" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
            <LocationSelect
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="Filter by city / location"
              districts={districts}
            />
          </div>

          {error && <p className="text-center" style={{ color: 'red', margin: '2rem 0' }}>{error}</p>}

          <div className="professionals-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)
            ) : labours.length === 0 ? (
              <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center' }}>
                <Search size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No professionals found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or location filters.</p>
              </div>
            ) : (
              labours.map((labour, index) => (
                <div key={labour._id || index} className="pro-card glass-card">
                  {labour.isVerified && (
                    <div className="badge-verified">
                      <ShieldCheck size={14} style={{ marginRight: '4px' }} /> EXPERT
                    </div>
                  )}
                  {!labour.isVerified && (
                    <div className="badge-unverified">COMMUNITY</div>
                  )}

                  <div className="pro-avatar">
                    <div className="avatar-circle">
                      <User size={32} />
                    </div>
                  </div>

                  <div className="pro-info">
                    <h3 className="pro-name">{labour.FullName}</h3>
                    <p className="pro-location"><MapPin size={16} /> {labour.Location}</p>
                    <p className="pro-location" style={{ marginTop: '0.2rem', color: 'var(--primary)', fontWeight: '500' }}>{labour.SelectSkill}</p>

                    <div className="pro-phone mt-2">
                      <Phone size={16} />
                      {labour.leadType === 'through_me' ? (
                        <span className="phone-masked">
                          Contact for Enquiry
                        </span>
                      ) : (
                        <>
                          <span className={labour.isUnlocked ? 'phone-visible' : 'phone-masked'}>
                            {labour.MobileNumber}
                          </span>
                          {!labour.isUnlocked && <Lock size={14} className="lock-icon" />}
                        </>
                      )}
                    </div>

                    {labour.Description && (
                      <p className="pro-description">{labour.Description}</p>
                    )}
                  </div>

                  {labour.leadType === 'through_me' ? (
                    <button
                      className="button w-full mt-auto button-primary"
                      onClick={() => handleConnect(labour)}
                    >
                      Enquiry Now
                    </button>
                  ) : (
                    <button
                      className={`button w-full mt-auto ${labour.isUnlocked ? 'button-outline' : 'button-primary'}`}
                      onClick={() => handleConnect(labour)}
                    >
                      {labour.isUnlocked ? 'Call Now' : 'Annual Access (₹499)'}
                    </button>
                  )}
                </div>
              ))
            )}
            {loadingMore && Array.from({ length: 3 }).map((_, i) => <React.Fragment key={`more-${i}`}>{renderSkeleton()}</React.Fragment>)}
          </div>

          {/* Load More Button */}
          {!loading && page < totalPages && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
              <button
                className="button button-outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
              >
                {loadingMore ? <RefreshCw className="spin" size={18} /> : null}
                {loadingMore ? 'Loading...' : 'Load More Professionals'}
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmSubscription}
          title="LoKal Buddy Subscription"
          message="Get unlimited access to all professional contacts and your Expert Verification Badge for 1 year at ₹499?"
          confirmText="Unlock Access"
        />

        <AlertModal
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertContent.title}
          message={alertContent.message}
        />
      </section>
    </div>
  );
};

export default ProfessionalsList;

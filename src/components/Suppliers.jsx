import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Phone, ShieldCheck, Search, RefreshCw, Box, Lock } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import './Services.css'; // Reusing CSS from Services
import { SUPPLIERS_API_URL, API_URL } from '../constants';
import LocationSelect from './LocationSelect';

const Suppliers = ({ isSubscribed }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SUPPLIERS_API_URL}/allsuppliersadmin`);
      const result = await response.json();

      if (result.success && result.data) {
        setSuppliers(result.data);
        setFilteredSuppliers(result.data);

        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(result.data.map(s => s.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      }
    } catch (err) {
      setError('Could not connect to the backend server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Filter effect
  useEffect(() => {
    let filtered = suppliers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.companyName && s.companyName.toLowerCase().includes(query)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(query))
      );
    }

    if (locationQuery) {
      const query = locationQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.location && s.location.toLowerCase().includes(query)) ||
        (s.exactLocation && s.exactLocation.toLowerCase().includes(query))
      );
    }

    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    setFilteredSuppliers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to first page
  }, [searchQuery, locationQuery, activeCategory, suppliers]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

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

  const handleConnect = (supplier) => {
    if (supplier.leadType === 'through_me') {
      setAlertContent({
        title: 'Enquiry Contact',
        message: `For enquiries regarding ${supplier.companyName}, please contact: ${supplier.addedByName || 'Admin'} at ${supplier.addedBy || 'our support line'}.`
      });
      setShowAlert(true);
      return;
    }

    if (isSubscribed) {
      window.location.href = `tel:${supplier.phone}`;
    } else {
      handleSubscribe();
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

  const displayedSuppliers = filteredSuppliers.slice(0, page * itemsPerPage);

  return (
    <section id="suppliers" className="services" style={{ background: 'var(--background-alt)' }}>
      <div className="section-container">
        <h2 className="heading-title">Explore <span className="text-primary">Suppliers & Vendors</span></h2>
        <p className="heading-subtitle">Reliable lokal businesses for all your needs</p>

        {/* Search & Filters */}
        <div className="search-filters glass-card">
          <div className="search-box">
            <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search business or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <LocationSelect
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="Filter by city / location"
              districts={districts}
            />
          </div>
          <div className="category-select">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-center" style={{ color: 'red', margin: '2rem 0' }}>{error}</p>}

        <div className="professionals-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)
          ) : displayedSuppliers.length === 0 ? (
            <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center' }}>
              <Box size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No suppliers found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search, location, or category filters to find what you're looking for.</p>
            </div>
          ) : (
            displayedSuppliers.map((supplier, index) => (
              <div key={supplier._id || index} className="pro-card glass-card">

                <div className="badge-verified">
                  <ShieldCheck size={14} style={{ marginRight: '4px' }} /> VERIFIED
                </div>

                <div className="pro-avatar">
                  {supplier.logo ? (
                    <img
                      src={supplier.logo}
                      alt={supplier.companyName}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
                    />
                  ) : (
                    <div className="avatar-circle">
                      <Briefcase size={32} />
                    </div>
                  )}
                </div>

                <div className="pro-info">
                  <h3 className="pro-name">{supplier.companyName}</h3>
                  <p className="pro-location" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Owner:</span> {supplier.ownerName}
                  </p>
                  <p className="pro-location"><MapPin size={16} /> {supplier.location}</p>
                  <p className="pro-location" style={{ marginTop: '0.2rem', color: 'var(--primary)', fontWeight: '500' }}>{supplier.category}</p>

                  <div className="pro-phone mt-2">
                    <Phone size={16} />
                    {supplier.leadType === 'through_me' ? (
                      <span className="phone-masked">
                        Contact for Enquiry
                      </span>
                    ) : (
                      <>
                        <span className={isSubscribed ? 'phone-visible' : 'phone-masked'}>
                          {isSubscribed ? supplier.phone : `XXXXXX${supplier.phone?.slice(-4) || 'XXXX'}`}
                        </span>
                        {!isSubscribed && <Lock size={14} className="lock-icon" />}
                      </>
                    )}
                  </div>
                </div>

                {supplier.leadType === 'through_me' ? (
                  <button
                    className="button w-full mt-auto button-primary"
                    onClick={() => handleConnect(supplier)}
                  >
                    Enquiry Now
                  </button>
                ) : (
                  <button
                    className={`button w-full mt-auto ${isSubscribed ? 'button-outline' : 'button-primary'}`}
                    onClick={() => handleConnect(supplier)}
                  >
                    {isSubscribed ? 'Call Now' : 'Annual Access (₹499)'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {!loading && page < totalPages && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <button
              className="button button-outline"
              onClick={handleLoadMore}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
            >
              Load More Suppliers
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
  );
};

export default Suppliers;

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  ChevronDown, 
  Hammer, 
  HardHat, 
  Wrench, 
  Zap, 
  Layers, 
  Paintbrush, 
  Droplet, 
  LayoutGrid, 
  Truck 
} from 'lucide-react';
import './Services.css';
import { API_URL } from '../constants';

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('carpenter')) return <Hammer size={28} className="text-primary" />;
  if (name.includes('concrete')) return <HardHat size={28} className="text-primary" />;
  if (name.includes('drill') || name.includes('boring')) return <Wrench size={28} className="text-primary" />;
  if (name.includes('electrician')) return <Zap size={28} className="text-primary" />;
  if (name.includes('mason')) return <Layers size={28} className="text-primary" />;
  if (name.includes('painter')) return <Paintbrush size={28} className="text-primary" />;
  if (name.includes('plumber')) return <Droplet size={28} className="text-primary" />;
  if (name.includes('tiler')) return <LayoutGrid size={28} className="text-primary" />;
  if (name.includes('transport')) return <Truck size={28} className="text-primary" />;
  
  return <Briefcase size={28} className="text-primary" />;
};

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

const Services = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const catResponse = await fetch(`${API_URL}/available-skills`);
        const catResult = await catResponse.json();
        if (catResult.success && catResult.data) {
          const allCatNames = catResult.data.map(cat => cat.name);
          setCategories(cleanCategories(allCatNames));
        }
      } catch (err) {
        setError('Could not fetch categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayCount = 4;
  const categoriesToShow = showAll ? categories : categories.slice(0, displayCount);

  return (
    <section id="services" className="services">
      <div className="section-container">
        <h2 className="heading-title">Explore <span className="text-primary">Professions</span></h2>
        <p className="heading-subtitle">Find experts across various categories</p>

        {error && <p className="text-center" style={{ color: 'red', margin: '2rem 0' }}>{error}</p>}

        {loading ? (
          <div className="category-cards-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card skeleton-card" style={{ height: '100px', animation: 'pulse 1.5s infinite', opacity: 0.7 }}></div>
            ))}
          </div>
        ) : (
          <>
            <div className="category-cards-grid">
              {categoriesToShow.map((cat, idx) => (
                <div 
                  key={idx} 
                  className="category-card glass-card"
                  onClick={() => onCategoryClick(cat)}
                >
                  <div className="category-icon-wrapper">
                    {getCategoryIcon(cat)}
                  </div>
                  <h3 className="category-card-title">{cat}</h3>
                </div>
              ))}
            </div>

            {!showAll && categories.length > displayCount && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                <button 
                  className="button button-outline" 
                  onClick={() => setShowAll(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
                >
                  More Professions <ChevronDown size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Services;


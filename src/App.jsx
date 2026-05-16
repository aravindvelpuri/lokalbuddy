import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ProfessionalsList from './pages/ProfessionalsList';
import './styles/global.css';

function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path.toLowerCase() === '/admin') return 'admin';
    if (path.toLowerCase() === '/profile') return 'profile';
    if (path.toLowerCase().startsWith('/professionals')) return 'professionals';
    return 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (window.location.pathname.toLowerCase().startsWith('/professionals')) {
      const params = new URLSearchParams(window.location.search);
      return params.get('category') || 'All';
    }
    return 'All';
  });

  // Sync URL with view changes
  const navigate = (newView, params = null) => {
    if (newView === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (newView === 'home') {
      window.history.pushState(null, '', '/');
    } else if (newView === 'profile') {
      window.history.pushState(null, '', '/profile');
    } else if (newView === 'professionals') {
      const qs = params?.category ? `?category=${encodeURIComponent(params.category)}` : '';
      window.history.pushState(null, '', `/professionals${qs}`);
      setSelectedCategory(params?.category || 'All');
    }
    setView(newView);
  };

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.toLowerCase() === '/admin') setView('admin');
      else if (path.toLowerCase() === '/profile') setView('profile');
      else if (path.toLowerCase().startsWith('/professionals')) {
        const params = new URLSearchParams(window.location.search);
        setSelectedCategory(params.get('category') || 'All');
        setView('professionals');
      } else setView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="app">
      {(view === 'home' || view === 'professionals') && (
        <LandingPage 
          view={view}
          selectedCategory={selectedCategory}
          onAdminClick={() => navigate('admin')} 
          onProfileClick={() => navigate('profile')}
          onCategoryClick={(cat) => navigate('professionals', { category: cat })}
          onBack={() => navigate('home')}
        />
      )}
      {view === 'admin' && (
        <AdminDashboard onBack={() => navigate('home')} />
      )}
      {view === 'profile' && (
        <Profile onBack={() => navigate('home')} />
      )}
    </div>
  );
}

export default App;


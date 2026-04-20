import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './styles/global.css';

function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path.toLowerCase() === '/admin') return 'admin';
    return 'home';
  });

  // Sync URL with view changes
  const navigate = (newView) => {
    if (newView === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (newView === 'home') {
      window.history.pushState(null, '', '/');
    }
    setView(newView);
  };

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.toLowerCase() === '/admin') setView('admin');
      else setView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="app">
      {view === 'home' && (
        <LandingPage 
          onAdminClick={() => navigate('admin')} 
          onProfileClick={() => navigate('profile')}
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


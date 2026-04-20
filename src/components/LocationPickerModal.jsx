import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './BaseModal.css';

// Fix leaflet default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, setAddress, setLoadingAddress }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      reverseGeocode(e.latlng, setAddress, setLoadingAddress);
    },
  });

  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
};

const reverseGeocode = async (latlng, setAddress, setLoadingAddress) => {
  setLoadingAddress(true);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || '';
      const suburb = data.address.suburb || data.address.neighbourhood || '';
      const state = data.address.state || '';
      
      let finalAddress = '';
      if (suburb && city) finalAddress = `${suburb}, ${city}`;
      else if (city) finalAddress = `${city}, ${state}`;
      else finalAddress = data.display_name.split(',').slice(0, 2).join(',');

      setAddress(finalAddress.trim());
    } else {
      setAddress("Location unknown");
    }
  } catch (err) {
    setAddress("Could not fetch address");
  } finally {
    setLoadingAddress(false);
  }
};

const LocationPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  // Default to central India
  const defaultCenter = [20.5937, 78.9629];

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setAddress('');
    }
  }, [isOpen]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setLoadingAddress(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(latlng);
        reverseGeocode(latlng, setAddress, setLoadingAddress);
      }, () => {
        alert("Geolocation permission denied or unavailable.");
        setLoadingAddress(false);
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="text-primary"/> Pick Your Location
          </h3>
          <button className="close-btn" onClick={onClose} style={{ zIndex: 10002 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', height: '400px', width: '100%', zIndex: 1 }}>
          <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} setLoadingAddress={setLoadingAddress} />
          </MapContainer>
          
          <button 
            onClick={handleLocateMe}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'white', padding: '0.6rem 1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: '1px solid var(--primary)', fontWeight: '600', color: 'var(--primary)' }}
          >
            <Navigation size={18} /> Locate Me
          </button>
        </div>

        <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Selected Location</p>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--surface-border)', minHeight: '50px', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
              {loadingAddress ? 'Fetching address...' : (address || 'Click on the map or use "Locate Me"')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="button button-outline" onClick={onClose}>Cancel</button>
            <button 
              className="button button-primary" 
              disabled={!address || loadingAddress}
              onClick={() => onSelect(address)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Check size={18} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LocationPickerModal;

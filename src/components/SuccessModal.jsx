import React from 'react';
import { Check } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, message, onClose, title = "Success!" }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={e => e.stopPropagation()}>
        <div className="success-icon-wrapper">
          <Check size={48} />
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <button className="button button-primary" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;

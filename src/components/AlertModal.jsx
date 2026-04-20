import React from 'react';
import BaseModal from './BaseModal';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="alert-modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button button-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AlertModal;

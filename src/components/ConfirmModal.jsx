import React from 'react';
import BaseModal from './BaseModal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button button-outline" onClick={onClose}>
            {cancelText}
          </button>
          <button className="button button-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;

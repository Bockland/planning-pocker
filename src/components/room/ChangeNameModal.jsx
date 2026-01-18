import React, { useState } from 'react';
import './ChangeNameModal.css';

const ChangeNameModal = ({ isOpen, onClose, onChangeName, currentName }) => {
  const [newName, setNewName] = useState(currentName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeName(newName);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Change Name</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label className="form-label">New Name</label>
            <input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Your name" 
              required 
              autoFocus
              className="input-field"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeNameModal;

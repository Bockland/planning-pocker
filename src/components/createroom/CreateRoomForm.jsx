import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoomForm.css';

const CreateRoomForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // Generate room ID
      const roomId = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save admin flag and alias
      sessionStorage.setItem(`poker_admin_${roomId}`, 'true');
      sessionStorage.setItem('poker_alias', name);
      
      // Navigate to room
      navigate(`/room/${roomId}`);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="container create-container">
      <div className="create-card">
        <h2 className="create-title">Create Room</h2>
        <form onSubmit={handleCreate} className="create-form">
          <div className="form-field">
            <label className="form-label">Your Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe" 
              required 
              autoFocus
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary btn-submit">
            Create Room
          </button>
        </form>
        <button 
          onClick={goHome} 
          className="btn-back"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CreateRoomForm;

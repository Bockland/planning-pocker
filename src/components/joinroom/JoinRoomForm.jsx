import React from 'react';
import { useJoinRoom } from '../../hooks/useJoinRoom';
import './JoinRoomForm.css';

const JoinRoomForm = () => {
  const {
    roomId,
    setRoomId,
    name,
    setName,
    handleJoin,
    goHome
  } = useJoinRoom();

  return (
    <div className="container join-container">
      <div className="join-card">
        <h2 className="join-title">Join Room</h2>
        <form onSubmit={handleJoin} className="join-form">
          <div className="form-field">
            <label className="form-label">Room Code</label>
            <input 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)} 
              placeholder="123456" 
              required 
              className="input-field" 
            />
          </div>
          <div className="form-field">
            <label className="form-label">Your Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe" 
              required 
              autoFocus={!!roomId}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary btn-submit">
            Enter Room
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

export default JoinRoomForm;

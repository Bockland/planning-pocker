import React from 'react';
import { useHome } from '../../hooks/useHome';
import './HomeOptions.css';

const HomeOptions = () => {
  const { createRoom, handleJoinRoom } = useHome();
  
  return (
    <div className="container home-container">
      <h1 className="home-title">
        Agile Planning Poker
      </h1>
      <p className="home-description">
        Real-time estimation tool for scrum teams. Simple, fast, and effectively secretive until the reveal.
      </p>
      
      <div className="home-buttons">
        <button 
          className="btn-primary btn-create-room" 
          onClick={createRoom}
        >
          Create New Room
        </button>
        <button 
          className="btn-join-room"
          onClick={handleJoinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default HomeOptions;

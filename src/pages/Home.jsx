import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import '../index.css';

const Home = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = uuidv4();
    sessionStorage.setItem(`poker_admin_${roomId}`, 'true');
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Agile Planning Poker
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
        Real-time estimation tool for scrum teams. Simple, fast, and effectively secretive until the reveal.
      </p>
      
      <button className="btn-primary" onClick={createRoom} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
        Create New Room
      </button>
    </div>
  );
};

export default Home;

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { v4 as uuidv4 } from 'uuid';
import '../index.css';

const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [alias, setAlias] = useState(sessionStorage.getItem('poker_alias') || '');
  const [hasJoined, setHasJoined] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');

  // Get or Create User ID
  useEffect(() => {
    let storedId = sessionStorage.getItem('poker_user_id');
    if (!storedId) {
        storedId = uuidv4();
        sessionStorage.setItem('poker_user_id', storedId);
    }
    setUserId(storedId);
  }, []);

  useEffect(() => {
     const adminFlag = sessionStorage.getItem(`poker_admin_${roomId}`);
     if (adminFlag === 'true') {
         setIsAdmin(true);
     }
  }, [roomId]);

  useEffect(() => {
      if(!socket) return;
      socket.on('kicked', () => {
          alert('You have been removed from the room.');
          sessionStorage.removeItem('poker_alias');
          sessionStorage.removeItem(`poker_admin_${roomId}`);
          navigate('/');
      });
      return () => socket.off('kicked');
  }, [socket, navigate, roomId]);

  useEffect(() => {
    if (socket && alias && userId && !hasJoined) {
      socket.emit('join_room', { roomId, name: alias, isAdmin, userId });
      setHasJoined(true);
    }
  }, [socket, alias, userId, roomId, hasJoined, isAdmin]);

  useEffect(() => {
    if (!socket) return;
    socket.on('update_room', (data) => {
      setRoomData(data);
      if (data && userId) {
        const participant = data.participants.find(p => p.userId === userId);
        if (participant) {
            setMyVote(participant.vote);
        }
      }
    });
    return () => {
      socket.off('update_room');
    };
  }, [socket, userId]);

  const handleSetAlias = (e) => {
    e.preventDefault();
    const name = e.target.alias.value;
    if (name.trim()) {
      sessionStorage.setItem('poker_alias', name);
      setAlias(name);
    }
  };

  const castVote = (vote) => {
    setMyVote(vote);
    socket.emit('vote', { roomId, vote });
  };

  const reveal = () => {
    socket.emit('reveal', { roomId });
  };

  const reset = () => {
    socket.emit('reset', { roomId });
  };

  const kickUser = (targetSocketId) => {
      if(window.confirm('Are you sure you want to remove this user?')) {
          socket.emit('kick_participant', { roomId, targetSocketId });
      }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }

  const averageScore = useMemo(() => {
      if (!roomData || !roomData.isRevealed) return null;
      const scores = roomData.participants
        .filter(p => !p.isAdmin) // Don't count admin (though they shouldn't have votes)
        .map(p => parseFloat(p.vote))
        .filter(v => !isNaN(v));
      
      if (scores.length === 0) return 0;
      const sum = scores.reduce((a, b) => a + b, 0);
      return (sum / scores.length).toFixed(1);
  }, [roomData]);

  // Derived state for display
  const adminParticipant = useMemo(() => roomData?.participants.find(p => p.isAdmin), [roomData]);
  const votingParticipants = useMemo(() => roomData?.participants.filter(p => !p.isAdmin), [roomData]);

  if (!alias) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2>Enter your name</h2>
          <form onSubmit={handleSetAlias} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input name="alias" placeholder="Your Name" autoFocus autoComplete="off" />
            <button type="submit" className="btn-primary">Join Room</button>
          </form>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return <div className="container">Loading room...</div>;
  }

  return (
    <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>Room: <span style={{ opacity: 0.7 }}>{roomId.slice(0, 8)}...</span></h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {isAdmin && (
                    <button 
                    onClick={copyLink}
                    style={{ 
                        backgroundColor: '#fdba74', color: '#7c2d12', border: '1px solid #c2410c' 
                    }}
                    >
                        Invitar
                    </button>
                )}
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('poker_alias');
                    window.location.reload();
                  }}
                  style={{ 
                      backgroundColor: '#ffedd5', color: '#7c2d12', border: '1px solid #c2410c' 
                  }}
                >
                    Cambiar Nombre
                </button>
            </div>
        </header>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Left Column: Participants Board */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                    {votingParticipants && votingParticipants.map((p) => (
                        <div key={p.userId || p.name} style={{ textAlign: 'center', position: 'relative' }}>
                            {isAdmin && p.userId !== userId && (
                                <button 
                                    onClick={() => kickUser(p.socketId)}
                                    style={{
                                        position: 'absolute', top: -10, right: -10,
                                        background: 'red', color: 'white',
                                        width: '24px', height: '24px',
                                        borderRadius: '50%', padding: 0,
                                        fontSize: '12px', zIndex: 10
                                    }}
                                    title="Kick User"
                                >
                                    ✕
                                </button>
                            )}
                        <div 
                            style={{ 
                            width: '60px', 
                            height: '90px', 
                            backgroundColor: p.vote ? (roomData.isRevealed ? 'rgb(77 159 96)' : '#3b82f6') : 'rgba(255,255,255,0.05)',
                            border: p.vote ? (roomData.isRevealed ? '2px solid rgb(48 113 12)' : '2px solid #3b82f6') : '2px dashed #475569',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 'bold',
                            color: roomData.isRevealed ? '#fff' : '#fff',
                            margin: '0 auto 0.5rem',
                            transition: 'all 0.3s ease',
                            boxShadow: p.vote ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {roomData.isRevealed && p.vote ? p.vote : (p.vote ? '👍' : '')}
                        </div>
                        <span style={{ display: 'block', fontSize: '0.9rem', color: p.userId === userId ? '#3b82f6' : '#cbd5e1' }}>
                            {p.name} {p.userId === userId && '(You)'}
                        </span>
                        </div>
                    ))}
                    {votingParticipants && votingParticipants.length === 0 && (
                        <p style={{ color: '#94a3b8' }}>Waiting for voters...</p>
                    )}
                    </div>

                    {/* Controls */}
                    {isAdmin && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                        <button className="btn-primary" onClick={reveal} disabled={roomData.isRevealed}>Revelar Puntajes</button>
                        <button className="btn-danger" onClick={reset}>Reiniciar Puntajes</button>
                        </div>
                    )}
                </div>

                {/* Voting Deck - Hide if Admin */}
                {!isAdmin && (
                    <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', minWidth: 'min-content', padding: '0 1rem' }}>
                        {CARDS.map(card => (
                        <button
                            key={card}
                            onClick={() => castVote(card)}
                            disabled={roomData.isRevealed}
                            style={{
                            width: '50px', height: '80px', borderRadius: '8px',
                            border: myVote === card ? '2px solid #3b82f6' : '1px solid #475569',
                            backgroundColor: myVote === card ? '#1e40af' : '#1e293b',
                            color: 'white', fontSize: '1.2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {card}
                        </button>
                        ))}
                    </div>
                    </div>
                )}
            </div>

            {/* Right Column: Sidebar (Admin & Stats) */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {/* Admin Info */}
                 <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Administrador
                    </h3>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {adminParticipant ? adminParticipant.name : 'Unknown'}
                    </div>
                 </div>

                 {/* Average Score */}
                 <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Promedio
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: roomData.isRevealed ? '#22c55e' : '#475569' }}>
                        {roomData.isRevealed && averageScore ? averageScore : '-'}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Room;

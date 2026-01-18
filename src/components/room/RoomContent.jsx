import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import { CARDS, EMOTICONS } from '../../config/config';
import ChangeNameModal from './ChangeNameModal';
import './RoomContent.css';

const RoomContent = () => {
  const {
    roomId,
    roomData,
    myVote,
    isAdmin,
    userId,
    isMobile,
    activeTab,
    reactionMenuTarget,
    hoveredCard,
    flyingEmojis,
    averageScore,
    adminParticipant,
    votingParticipants,
    cardRefs,
    setActiveTab,
    setReactionMenuTarget,
    setHoveredCard,
    castVote,
    reveal,
    reset,
    kickUser,
    copyLink,
    handleSendReaction,
    isNameModalOpen,
    openNameModal,
    closeNameModal,
    handleChangeName,
    alias
  } = useRoom();

  if (!roomData) {
    return <div className="container">Loading room...</div>;
  }

  return (
    <div className="container">
        <header className="room-header">
            <h2 className={`room-title ${isMobile ? 'room-title-mobile' : ''}`}>
                Room: <span className="room-id">{roomId.slice(0, 8)}</span>
            </h2>
            <div className="room-actions">
                {isAdmin && (
                    <button 
                    onClick={copyLink}
                    className={`btn-invite ${isMobile ? 'btn-mobile' : ''}`}
                    >
                        Invitar
                    </button>
                )}
                <button 
                  onClick={openNameModal}
                  className={`btn-change-name ${isMobile ? 'btn-mobile' : ''}`}
                >
                    Cambiar Nombre
                </button>
            </div>
        </header>

        {/* Mobile Tabs */}
        {isMobile && (
            <div className="mobile-tabs">
                <div 
                    onClick={() => setActiveTab('participants')}
                    className={`mobile-tab ${activeTab === 'participants' ? 'mobile-tab-active' : ''}`}
                >
                    Participantes
                </div>
                <div 
                    onClick={() => setActiveTab('details')}
                    className={`mobile-tab ${activeTab === 'details' ? 'mobile-tab-active' : ''}`}
                >
                    Detalles
                </div>
            </div>
        )}

        <div className="room-content">
            {/* Left Column: Participants Board */}
            <div 
                className={`participants-column ${(!isMobile || activeTab === 'participants') ? 'visible' : 'hidden'} ${isMobile ? 'mobile-full-width' : ''}`}
            >
                <div className="card participants-card">
                    <div className="participants-grid">
                    {votingParticipants && votingParticipants.map((p) => (
                        <div key={p.userId || p.name} 
                             ref={el => cardRefs.current[p.userId] = el}
                             className="participant-item"
                             onMouseEnter={() => !isMobile && setHoveredCard(p.userId)}
                             onMouseLeave={() => !isMobile && setHoveredCard(null)}
                        >
                            {isAdmin && p.userId !== userId && (
                                <button 
                                    onClick={() => kickUser(p.socketId)}
                                    className="btn-kick"
                                    title="Kick User"
                                >
                                    ✕
                                </button>
                            )}

                             {/* Reaction Button */}
                             {p.userId !== userId && (hoveredCard === p.userId || reactionMenuTarget === p.userId || isMobile) && (
                                <div className="reaction-menu-container">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReactionMenuTarget(reactionMenuTarget === p.userId ? null : p.userId);
                                        }} 
                                        className={`btn-react ${reactionMenuTarget === p.userId ? 'btn-react-open' : ''}`}
                                        title="React"
                                    >
                                        ☺
                                    </button>
                                     
                                    {/* Popover Menu */}
                                    {reactionMenuTarget === p.userId && (
                                        <div 
                                          className="reaction-popover"
                                          onMouseLeave={() => setReactionMenuTarget(null)}
                                        >
                                            {EMOTICONS.map(emoji => (
                                                <button key={emoji}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSendReaction(p.userId, emoji);
                                                    }}
                                                    className="btn-emoji"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                             )}

                        <div 
                            className={`vote-card ${p.vote ? (roomData.isRevealed ? 'vote-card-revealed' : 'vote-card-voted') : 'vote-card-empty'}`}
                        >
                            {roomData.isRevealed && p.vote ? p.vote : (p.vote ? '👍' : '')}
                        </div>
                        <span className={`participant-name ${p.userId === userId ? 'participant-name-me' : ''}`}>
                            {p.name} {p.userId === userId && '(You)'}
                        </span>
                        </div>
                    ))}
                    {votingParticipants && votingParticipants.length === 0 && (
                        <p className="no-voters">Waiting for voters...</p>
                    )}
                    </div>

                    {/* Controls */}
                    {isAdmin && (
                        <div className="admin-controls">
                        <button className="btn-primary" onClick={reveal} disabled={roomData.isRevealed}>Revelar Puntajes</button>
                        <button className="btn-danger" onClick={reset}>Reiniciar Puntajes</button>
                        </div>
                    )}
                </div>

                {/* Voting Deck - Hide if Admin */}
                {!isAdmin && (
                    <div className="voting-deck-container">
                    <div className="voting-deck">
                        {CARDS.map(card => (
                        <button
                            key={card}
                            onClick={() => castVote(card)}
                            disabled={roomData.isRevealed}
                            className={`vote-button ${myVote === card ? 'vote-button-selected' : ''}`}
                        >
                            {card}
                        </button>
                        ))}
                    </div>
                    </div>
                )}
            </div>

            {/* Right Column: Sidebar (Admin & Stats) */}
            <div 
                className={`sidebar-column ${(!isMobile || activeTab === 'details') ? 'visible' : 'hidden'} ${isMobile ? 'mobile-full-width' : ''}`}
            >
                 {/* Admin Info */}
                 <div className="card info-card">
                    <h3 className="info-title">
                        Administrador
                    </h3>
                    <div className="info-value">
                        {adminParticipant ? adminParticipant.name : 'Unknown'}
                    </div>
                 </div>

                 {/* Average Score */}
                 <div className="card info-card">
                    <h3 className="info-title">
                        Promedio
                    </h3>
                    <div className={`average-score ${roomData.isRevealed ? 'average-score-revealed' : ''}`}>
                        {roomData.isRevealed && averageScore ? averageScore : '-'}
                    </div>
                 </div>
            </div>
        </div>

        {/* Change Name Modal */}
        <ChangeNameModal 
            isOpen={isNameModalOpen}
            onClose={closeNameModal}
            onChangeName={handleChangeName}
            currentName={alias}
        />

        {/* Flying Emojis Layer */}
        {flyingEmojis.map(item => (
            <div key={item.id} className="flying-emoji-wrapper" style={item.style}>
                <div className="flying-emoji-inner">
                    {item.emoji}
                </div>
            </div>
        ))}
    </div>
  );
};

export default RoomContent;

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { v4 as uuidv4 } from 'uuid';

export const useRoom = () => {
    const { roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();
    const [alias, setAlias] = useState(sessionStorage.getItem('poker_alias') || '');
    const [hasJoined, setHasJoined] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [myVote, setMyVote] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState('');
    
    // Refs for animation
    const cardRefs = useRef({}); // { [userId]: DOMElement }
    const [flyingEmojis, setFlyingEmojis] = useState([]); // [{ id, fromX, fromY, toX, toY, emoji }]
    
    // Mobile Tabs State
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeTab, setActiveTab] = useState('participants');

    // Reactions State
    const [reactions, setReactions] = useState({}); // { [userId]: '👍' }
    const [reactionMenuTarget, setReactionMenuTarget] = useState(null); // userId (Open Menu)
    const [hoveredCard, setHoveredCard] = useState(null); // userId (Show Button)

    // Name Change Modal State
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);

    // Handle Resize for Mobile View
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        const handleKicked = () => {
            alert('You have been removed from the room.');
            sessionStorage.removeItem('poker_alias');
            sessionStorage.removeItem(`poker_admin_${roomId}`);
            navigate('/');
        };
        socket.on('kicked', handleKicked);
        return () => socket.off('kicked', handleKicked);
    }, [socket, navigate, roomId]);

    useEffect(() => {
        if (socket && alias && userId && !hasJoined) {
            socket.emit('join_room', { roomId, name: alias, isAdmin, userId });
            setHasJoined(true);
        }
    }, [socket, alias, userId, roomId, hasJoined, isAdmin]);

    useEffect(() => {
        if (!socket) return;
        
        const handleUpdateRoom = (data) => {
            setRoomData(data);
            if (data && userId) {
                const participant = data.participants.find(p => p.userId === userId);
                if (participant) {
                    setMyVote(participant.vote);
                }
            }
        };

        const handleReactionReceived = ({ fromUserId, targetUserId, reaction }) => {
            // Calculate positions for flying animation
            if (fromUserId && targetUserId && cardRefs.current[fromUserId] && cardRefs.current[targetUserId]) {
                const startRect = cardRefs.current[fromUserId].getBoundingClientRect();
                const endRect = cardRefs.current[targetUserId].getBoundingClientRect();
                const id = uuidv4();
                const emojiSize = 32; // Approx size of emoji wrapper

                setFlyingEmojis(prev => [...prev, {
                    id,
                    emoji: reaction,
                    style: {
                        '--startX': `${startRect.left + startRect.width / 2 - emojiSize / 2}px`,
                        '--startY': `${startRect.top + startRect.height / 2 - emojiSize / 2}px`,
                        '--endX': `${endRect.left + endRect.width / 2 - emojiSize / 2}px`,
                        '--endY': `${endRect.top + endRect.height / 2 - emojiSize / 2}px`,
                    }
                }]);

                // Clean up flying emoji after animation
                setTimeout(() => {
                    setFlyingEmojis(prev => prev.filter(e => e.id !== id));
                }, 600); // Animation duration (0.6s)
            }
        };

        socket.on('update_room', handleUpdateRoom);
        socket.on('reaction_received', handleReactionReceived);

        return () => {
            socket.off('update_room', handleUpdateRoom);
            socket.off('reaction_received', handleReactionReceived);
        };
    }, [socket, userId]);

    // Click Outside Listener to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reactionMenuTarget && !event.target.closest('.reaction-menu-container')) {
                setReactionMenuTarget(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [reactionMenuTarget]);

    useEffect(() => {
        // If no alias, redirect to join page with room ID
        if (!alias && roomId) {
            navigate(`/join?code=${roomId}`);
        }
    }, [alias, roomId, navigate]);

    // Removed handleSetAlias as it's handled in JoinRoom now

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
    };

    const handleSendReaction = (targetUserId, reaction) => {
        socket.emit('send_reaction', { roomId, targetUserId, reaction });
        // Removed setReactionMenuTarget(null) to keep menu open
    };

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

    const adminParticipant = useMemo(() => roomData?.participants.find(p => p.isAdmin), [roomData]);
    const votingParticipants = useMemo(() => roomData?.participants.filter(p => !p.isAdmin), [roomData]);

    const logout = () => {
        sessionStorage.removeItem('poker_alias');
        setAlias('');
        setHasJoined(false);
    };

    const openNameModal = () => {
        setIsNameModalOpen(true);
    };

    const closeNameModal = () => {
        setIsNameModalOpen(false);
    };

    const handleChangeName = (newName) => {
        if (newName.trim() && socket) {
            sessionStorage.setItem('poker_alias', newName);
            setAlias(newName);
            // Re-emit join with new name
            socket.emit('join_room', { roomId, name: newName, isAdmin, userId });
            closeNameModal();
        }
    };

    return {
        // State
        roomId,
        alias,
        roomData,
        myVote,
        isAdmin,
        userId,
        isMobile,
        activeTab,
        reactionMenuTarget,
        hoveredCard,
        flyingEmojis,
        
        // Derived State
        averageScore,
        adminParticipant,
        votingParticipants,

        // Refs
        cardRefs,

        // Actions
        setActiveTab,
        setReactionMenuTarget,
        setHoveredCard,
        setHoveredCard,
        // handleSetAlias - Removed
        castVote,
        reveal,
        reset,
        kickUser,
        copyLink,
        handleSendReaction,
        logout,
        
        // Name Modal
        isNameModalOpen,
        openNameModal,
        closeNameModal,
        handleChangeName
    };
};

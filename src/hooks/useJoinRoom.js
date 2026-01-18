import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useJoinRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setRoomId(code);
    }
  }, [searchParams]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim() && name.trim()) {
      sessionStorage.setItem('poker_alias', name);
      navigate(`/room/${roomId}`);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return {
    roomId,
    setRoomId,
    name,
    setName,
    handleJoin,
    goHome
  };
};

import { useNavigate } from 'react-router-dom';

export const useHome = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    navigate('/create');
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return {
    createRoom,
    handleJoinRoom
  };
};

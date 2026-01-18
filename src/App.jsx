import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import Room from './pages/Room';
import JoinRoom from './pages/JoinRoom';
import CreateRoom from './pages/CreateRoom';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;

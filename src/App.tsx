import { Router, Route } from 'preact-router';
import { useState, useRef, useEffect } from 'preact/hooks';
import { UsernameForm } from './components/UsernameForm';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import About from './pages/About';
import { Chat } from './pages/Chat';

export function App() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    // Focus the input when component mounts
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Auto-expand when resizing to desktop
      if (!mobile && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const handleJoinRoom = () => {
    const roomNum = parseInt(roomId);
    if (roomNum > 0 && roomNum <= 9999) {
      setIsInvalid(false);
      setRoomId(roomId);
    } else {
      setIsInvalid(true);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  if (!username) {
    return <UsernameForm onSetUsername={setUsername} />;
  }

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
        <div className="border border-terminal-accent p-6 w-full max-w-2xl">
          <h1 className="text-2xl font-mono text-terminal-text mb-6 text-center">
            $ join_chat_room.sh
          </h1>
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-terminal-accent">$</span>
                <span className="ml-2 text-terminal-text/80">Enter room number (1-9999):</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-terminal-accent">></span>
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  max="9999"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId((e.target as HTMLInputElement).value);
                    setIsInvalid(false);
                  }}
                  onKeyDown={handleKeyDown}
                  className={`w-full pl-8 pr-3 py-2 bg-terminal-bg border ${
                    isInvalid ? 'border-red-500' : 'border-terminal-accent'
                  } text-terminal-text font-mono focus:outline-none focus:ring-1 focus:ring-terminal-accent`}
                  placeholder="_"
                  autoComplete="off"
                />
              </div>
              {isInvalid && (
                <p className="mt-1 text-sm text-red-500 font-mono">
                  ! Please enter a valid room number between 1 and 9999
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleJoinRoom}
                className="flex-1 bg-terminal-accent/10 text-terminal-accent py-2 px-4 font-mono border border-terminal-accent hover:bg-terminal-accent/20 focus:outline-none focus:ring-1 focus:ring-terminal-accent disabled:opacity-50"
                disabled={!roomId.trim()}
              >
                $ ./join_room
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-terminal-bg text-terminal-text/50 py-2 px-4 font-mono border border-terminal-text/30 hover:bg-terminal-text/10 focus:outline-none"
              >
                $ cancel
              </button>
            </div>
            <div className="pt-4 mt-4 border-t border-terminal-accent/30">
              <p className="text-xs text-terminal-text/50 text-center">
                $ Type a room number or ask a friend for their room number to join
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app" className={isCollapsed ? 'collapsed' : ''}>
      <Header 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      <main className="flex-1">
        <Router>
          <Route path="/" component={() => <Home setRoomId={setRoomId} />} />
          <Route path="/about" component={About} />
          <Route path="/chat/:roomId" component={Chat} />
        </Router>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from 'preact/hooks';
import { io } from 'socket.io-client';

interface UsernameFormProps {
  onSetUsername: (username: string) => void;
  roomId: string;
  onBack: () => void;
}

export function UsernameForm({ onSetUsername, roomId, onBack }: UsernameFormProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [socket, setSocket] = useState(null);
  const pendingUsernameRef = useRef('');

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('usernameValidation', (data) => {
      setIsValidating(false);
      if (data.valid) {
        onSetUsername(pendingUsernameRef.current);
      } else {
        setError(data.error);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [onSetUsername]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }
    
    if (!socket) {
      setError('Connection error. Please try again.');
      return;
    }

    setIsValidating(true);
    setError('');
    pendingUsernameRef.current = trimmedUsername;

    socket.emit('validateUsername', {
      username: trimmedUsername,
      roomId: roomId
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="border border-terminal-accent p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-mono text-terminal-text mb-6 text-center">
          $ welcome_to_quickchat.sh
        </h1>
        <div className="text-center">
          <p className="mt-4 text-sm text-gray-600">Room: {roomId}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-mono text-terminal-text mb-2">
              $ Enter your username:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-terminal-text">$</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername((e.target as HTMLInputElement).value);
                  setError('');
                }}
                className="w-full pl-6 pr-3 py-2 bg-black border border-terminal-accent text-terminal-text font-mono focus:outline-none focus:ring-1 focus:ring-terminal-accent"
                placeholder="username"
                autoComplete="off"
                maxLength={20}
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500 font-mono">
                ! {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isValidating}
            className={`w-full py-2 px-4 font-mono focus:outline-none focus:ring-1 focus:ring-terminal-accent ${
              isValidating 
                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed' 
                : 'bg-terminal-accent/10 text-terminal-accent hover:bg-terminal-accent/20'
            }`}
          >
            {isValidating ? '$ validating...' : '$ ./start_chat'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-gray-500/10 text-gray-600 py-2 px-4 font-mono hover:bg-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            $ cd ../room_selection
          </button>
        </form>
      </div>
    </div>
  );
}

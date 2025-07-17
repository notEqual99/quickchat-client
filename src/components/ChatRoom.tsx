import { useEffect, useRef, useState } from 'preact/hooks';
import { io, Socket } from 'socket.io-client';

interface Message {
  username: string;
  text: string;
  timestamp: number; 
}

interface ChatRoomProps {
  username: string;
  roomId: string;
}

export function ChatRoom({ username, roomId }: ChatRoomProps) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [roomStats, setRoomStats] = useState<{userCount: number; activeUsers: string[]}>({userCount: 0, activeUsers: []});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isKicked, setIsKicked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const heartbeatInterval = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    const preventNavigation = (e: BeforeUnloadEvent) => {
      if (!isKicked && !error && sessionId) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the chat room?';
        return 'Are you sure you want to leave the chat room?';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        return;
      }
      
      if (socket && sessionId) {
        socket.emit('heartbeat', { username, roomId, sessionId });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
      }
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        if (!window.confirm('Are you sure you want to refresh? You will leave the chat room.')) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', preventNavigation);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', preventNavigation);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isKicked, error, sessionId, socket, username, roomId]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isKicked || error) {
        return;
      }

      if (sessionId && socket && socket.connected) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        
        if (window.confirm('Are you sure you want to leave the chat room?')) {
          cleanupAndLeave();
        }
        return;
      }

      window.location.href = '/';
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sessionId, socket, isKicked, error]);

  const cleanupAndLeave = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    if (socket && socket.connected) {
      socket.emit('leaveRoom', { username, roomId });
      socket.disconnect();
    }
    
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const startHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = window.setInterval(() => {
      if (socket && socket.connected && sessionId) {
        socket.emit('heartbeat', { username, roomId, sessionId });
      }
    }, 30000);
  };

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

    if (!serverUrl) {
      console.error('❌ VITE_REACT_APP_SERVER_URL is not defined');
      setError('Server configuration error');
      setIsValidating(false);
      return;
    }

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      newSocket.emit('validateUsername', { username, roomId });
    });

    newSocket.on('usernameValidation', (response: { valid: boolean; error?: string }) => {
      if (response.valid) {
        newSocket.emit('joinRoom', { username, roomId });
      } else {
        setError(response.error || 'Username validation failed');
        setIsValidating(false);
        setConnectionStatus('error');
      }
    });

    newSocket.on('sessionEstablished', (data: { sessionId: string; username: string; roomId: string }) => {
      setSessionId(data.sessionId);
      setIsValidating(false);
      setError(null);
      startHeartbeat();
    });

    newSocket.on('sessionKicked', (data: { reason: string; timestamp: number }) => {
      setIsKicked(true);
      setError(`Session terminated: ${data.reason}`);
      setConnectionStatus('error');
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    });

    newSocket.on('sessionInvalid', () => {
      setError('Session expired or invalid');
      setIsKicked(true);
      setConnectionStatus('error');
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    });

    newSocket.on('heartbeatAck', () => {
      // Heartbeat acknowledged, session is valid
    });

    newSocket.on('error', (errorMessage: string) => {
      setError(errorMessage);
      setIsValidating(false);
      setConnectionStatus('error');
    });

    newSocket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('roomStats', (data: {userCount: number; activeUsers: string[]}) => {
      setRoomStats(data);
      setActiveUsers(data.activeUsers);
    });

    newSocket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      setActiveUsers([]);
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      if (!isKicked && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          if (!isKicked) {
            newSocket.connect();
          }
        }, 2000 * reconnectAttempts.current);
      }
    });

    newSocket.on('connect_error', () => {
      setConnectionStatus('error');
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Unable to connect to server after multiple attempts');
        setIsValidating(false);
      }
    });

    newSocket.on('reconnect', () => {
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      if (sessionId) {
        newSocket.emit('heartbeat', { username, roomId, sessionId });
      } else {
        newSocket.emit('validateUsername', { username, roomId });
      }
    });

    setSocket(newSocket);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      if (newSocket.connected) {
        newSocket.emit('leaveRoom', { username, roomId });
      }
      newSocket.disconnect();
    };
  }, [username, roomId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isValidating && !error && !isKicked) {
      inputRef.current?.focus();
    }
  }, [isValidating, error, isKicked]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!message.trim() || !sessionId) return;

    const newMessage: Message & { roomId: string } = {
      username,
      text: message.trim(),
      timestamp: Date.now(),
      roomId,
    };

    socket?.emit('chatMessage', newMessage);
    setMessage('');
    setTyping(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the chat room?')) {
      cleanupAndLeave();
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleGoBack = () => {
    cleanupAndLeave();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isValidating) {
    return (
      <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-mono justify-center items-center">
        <div className="text-center space-y-4">
          <div className="text-terminal-accent">$</div>
          <div className="text-sm">Validating session...</div>
          <div className="text-xs text-terminal-text/50">
            Checking if "{username}" is available in room #{roomId}
          </div>
        </div>
      </div>
    );
  }

  if (error || isKicked) {
    return (
      <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-mono justify-center items-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-400 text-2xl">$</div>
          <div className="text-lg text-red-400">
            {isKicked ? 'Session Terminated' : 'Cannot Join Room'}
          </div>
          <div className="text-sm text-terminal-text/80 border border-red-400/30 p-4 rounded bg-red-400/5">
            <div className="mb-2">
              <span className="text-red-400">Error:</span> {error}
            </div>
            <div className="text-xs text-terminal-text/50">
              Room: #{roomId} | Username: {username}
            </div>
            {isKicked && (
              <div className="text-xs text-yellow-400 mt-2">
                This usually happens when the same username is used in another browser or device.
              </div>
            )}
          </div>
          <div className="space-x-4">
            <button 
              onClick={handleGoBack}
              className="px-4 py-2 bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/30 rounded hover:bg-terminal-accent/20 transition-colors"
            >
              Go Home
            </button>
            {!isKicked && (
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded hover:bg-yellow-400/20 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-mono overflow-hidden">
      <div className="status-bar px-4 py-2 text-xs border-b border-terminal-accent/30">
        <span className="text-terminal-accent">$</span> Status: 
        <span className={`ml-2 ${
          connectionStatus === 'connected' ? 'text-green-400' : 
          connectionStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {connectionStatus}
        </span>
        {connectionStatus === 'connected' && (
          <span className="text-terminal-text/50 ml-2">
            | Room: {roomId} | Name: {username}
          </span>
        )}
        {sessionId && (
          <span className="text-terminal-text/50 ml-2">
            | Session: {sessionId.slice(0, 6)}...
          </span>
        )}
        <span className="ml-2">
          <span 
            className="cursor-pointer hover:text-terminal-accent transition-colors"
            onClick={toggleDropdown}
            title="Show active users"
          >
            | Active: <span className="text-terminal-accent">{roomStats.userCount}</span>
          </span>
          {isDropdownOpen && roomStats.activeUsers.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute mt-1 ml-1 bg-terminal-bg border border-terminal-accent/30 rounded shadow-lg z-50 max-h-40 overflow-y-auto"
            >
              <ul className="py-1 text-sm">
                <li className="px-3 py-1 text-terminal-text/80">Active Users:</li>
                {roomStats.activeUsers.map((user, index) => (
                  <li 
                    key={index}
                    className="px-3 py-1 hover:bg-terminal-accent/10 text-terminal-text/80"
                  >
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </span>
        <span className="ml-2">
          | <button 
              onClick={handleLeaveRoom}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Leave room"
            >
              Leave Room
            </button>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-terminal-text/50 mt-8">
            $ No messages yet. Type a message to start chatting...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.username === username ? 'justify-end' : 
                msg.username === 'System' ? 'justify-center' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 border ${
                  msg.username === username
                    ? 'border-terminal-accent text-terminal-text rounded-l-lg rounded-tr-lg'
                    : msg.username === 'System'
                    ? 'border-yellow-400/30 text-yellow-400/80 rounded-lg bg-yellow-400/5'
                    : 'border-terminal-text/30 text-terminal-text/80 rounded-r-lg rounded-tl-lg'
                }`}
              >
                <div className="text-xs mb-1">
                  <span className="text-terminal-accent">$</span>{' '}
                  <span className={
                    msg.username === username ? 'text-terminal-accent' : 
                    msg.username === 'System' ? 'text-yellow-400' : 'text-terminal-text/80'
                  }>
                    {msg.username === username ? 'you' : msg.username.toLowerCase()}
                  </span>
                  <span className="text-terminal-text/50"> @ {formatTime(msg.timestamp)}</span>
                </div>
                <div className="text-sm">
                  {msg.text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit}
        className="border-t border-terminal-accent p-3"
      >
        <div className="flex items-center space-x-2">
          <span className="text-terminal-accent">$</span>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setMessage(val);
              setTyping(val.length > 0);
            }}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-terminal-text placeholder-terminal-text/50"
            autoComplete="off"
            disabled={!sessionId}
          />
          <button
            type="submit"
            className={`px-4 py-1 border focus:outline-none transition-colors ${
              typing && sessionId
                ? 'bg-terminal-accent/60 text-white border-terminal-accent cursor-pointer hover:bg-terminal-accent/90 active:bg-terminal-accent/80'
                : 'bg-terminal-accent/10 text-terminal-accent/50 border-terminal-accent/30'
            }`}
            disabled={!message.trim() || !sessionId}
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}
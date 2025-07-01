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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [roomStats, setRoomStats] = useState<{userCount: number; activeUsers: string[]}>({userCount: 0, activeUsers: []});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

    if (!serverUrl) {
      console.error('❌ VITE_REACT_APP_SERVER_URL is not defined');
      return;
    }

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      newSocket.emit('joinRoom', { username, roomId });
    });

    newSocket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('roomStats', (data: {userCount: number; activeUsers: string[]}) => {
      setRoomStats(data);
      setActiveUsers(data.activeUsers);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      setActiveUsers([]);
    });

    newSocket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    newSocket.on('reconnect', () => {
      setConnectionStatus('connected');
      newSocket.emit('joinRoom', { username, roomId });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.emit('leaveRoom', { username, roomId });
      }
      newSocket.disconnect();
    };
  }, [username, roomId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && socket.connected) {
        socket.emit('leaveRoom', { username, roomId });
        socket.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // const handleVisibilityChange = () => {
    //   if (document.hidden) {
    //     console.log('User left the page/tab');
    //   } else {
    //     console.log('User returned to the page/tab');
    //     if (socket && !socket.connected) {
    //       socket.connect();
    //     }
    //   }
    // };

    // document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, username, roomId]);

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
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message & { roomId: string } = {
      username,
      text: message.trim(),
      timestamp: Date.now(),
      roomId,
    };

    socket?.emit('chatMessage', newMessage);
    setMessage('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the chat room?')) {
      if (socket && socket.connected) {
        socket.emit('leaveRoom', { username, roomId });
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

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
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            const newMessage: Message & { roomId: string } = {
              username,
              text: message.trim(),
              timestamp: Date.now(),
              roomId,
            };
            socket?.emit('chatMessage', newMessage);
            setMessage('');
          }
          setTyping(false);
        }} 
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
            }}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-terminal-text placeholder-terminal-text/50"
            autoComplete="off"
            onKeyDown={(e) => {
              const currentValue = (e.target as HTMLInputElement).value;
              const currentKey = e.key;

              if (currentKey.length === 1 || currentKey === ' ' || currentKey === 'Backspace') {
                let newValue = currentValue;
                if (currentKey === 'Backspace') {
                  newValue = currentValue.slice(0, -1);
                } else {
                  newValue = currentValue + currentKey;
                }
                setTyping(true);

                if (newValue === "") {
                  setTyping(false);
                }
              }

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                const messageText = input.value;
                
                if (messageText !== '') {
                  const newMessage: Message & { roomId: string } = {
                    username,
                    text: messageText,
                    timestamp: Date.now(),
                    roomId,
                  };
                  socket?.emit('chatMessage', newMessage);
                  setMessage('');
                  setTyping(false);
                }
              }
            }}
          />
          <button
            type="submit"
            className={`px-4 py-1 border focus:outline-none transition-colors ${
              typing
                ? 'bg-terminal-accent/60 text-white border-terminal-accent cursor-pointer hover:bg-terminal-accent/90 active:bg-terminal-accent/80'
                : 'bg-terminal-accent/10 text-terminal-accent/50 border-terminal-accent/30'
            }`}
            disabled={!message.trim()}
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}
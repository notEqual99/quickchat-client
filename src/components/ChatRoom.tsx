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
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_REACT_APP_SERVER_URL);

    newSocket.on('connect', () => {
      console.log('$ Connected to server');
      newSocket.emit('joinRoom', { username, roomId });
    });

    newSocket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('roomUsers', (users: string[]) => {
      console.log('$ Users in room:', users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [username, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus the input when component mounts
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

  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text font-mono overflow-hidden">
      {/* Header */}
      <header className="border-b border-terminal-accent p-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg">$ room: <span className="text-terminal-accent">#{roomId}</span></h1>
          <div className="text-sm">user: <span className="text-terminal-accent">{username}</span></div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-terminal-text/50 mt-8">
            $ No messages yet. Type a message to start chatting...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 border ${
                  msg.username === username
                    ? 'border-terminal-accent text-terminal-text rounded-l-lg rounded-tr-lg'
                    : 'border-terminal-text/30 text-terminal-text/80 rounded-r-lg rounded-tl-lg'
                }`}
              >
                <div className="text-xs mb-1">
                  <span className="text-terminal-accent">$</span>{' '}
                  <span className={msg.username === username ? 'text-terminal-accent' : 'text-terminal-text/80'}>
                    {msg.username === username ? 'you' : msg.username}
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

      {/* Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            handleSubmit(e);
          }
        }} 
        className="border-t border-terminal-accent p-3"
      >
        <div className="flex items-center space-x-2">
          <span className="text-terminal-accent">$</span>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage((e.target as HTMLInputElement).value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-terminal-text placeholder-terminal-text/50"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  handleSubmit(e);
                }
              }
            }}
          />
          <button
            type="submit"
            className="bg-terminal-accent/10 text-terminal-accent px-4 py-1 border border-terminal-accent hover:bg-terminal-accent/20 focus:outline-none disabled:opacity-50"
            disabled={!message.trim()}
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}

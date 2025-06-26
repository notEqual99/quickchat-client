import { useState } from 'preact/hooks';
import './style.css';
import { UsernameForm } from '../../components/UsernameForm';

export function Home() {
	const [username, setUsername] = useState('');
	const [roomId, setRoomId] = useState('');
	
	const handleJoinRoom = () => {
		const trimmedRoomId = roomId.trim();
		const roomNumber = parseInt(trimmedRoomId);
		
		if (!trimmedRoomId || isNaN(roomNumber) || roomNumber < 1 || roomNumber > 9999) {
			alert('Please enter a valid room number between 1 and 9999');
			return;
		}
		window.location.href = `/chat/${roomNumber}?username=${username}`;
	};

  const handleJoinRoomKeyDown = (inputValue: string) => {
    if (!inputValue) {
      alert('Please enter a valid room number between 1 and 9999');
			return;
    }
    window.location.href = `/chat/${inputValue}?username=${username}`;
  };
	
	if (!username) {
		return <UsernameForm onSetUsername={setUsername} />;
	}
	
  return (
    <div className="chat-form min-h-screen flex items-center justify-center bg-terminal-bg">
      <div className="chat-form bg-terminal-bg p-8 rounded-lg shadow-md w-96">
        <h1 className="chat-form text-2xl font-bold mb-6 text-center">Join a Chat Room</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number (1-9999)
            </label>
            <input
              type="number"
              min="1"
              max="9999"
              value={roomId}
              onChange={(e) => setRoomId((e.target as HTMLInputElement).value)}
              className="w-full px-3 py-2 border border-terminal-accent rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-accent"
              placeholder="Enter room number"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const currentInputValue = (e.target as HTMLInputElement).value;
									handleJoinRoomKeyDown(currentInputValue);
                }
              }}
            />
          </div>
          <button
            onClick={handleJoinRoom}
            className="w-full bg-terminal-accent/10 text-terminal-accent py-2 px-4 rounded-md hover:bg-terminal-accent/20 focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:ring-offset-2"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'preact/hooks';
import './style.css';
import { UsernameForm } from '../../components/UsernameForm';
import { ChatRoom } from '../../components/ChatRoom';

export function Home() {
	const [username, setUsername] = useState('');
	const [roomId, setRoomId] = useState('');
	
	if (!username) {
		return <UsernameForm onSetUsername={setUsername} />;
	}
	
	if (!roomId) {
		return (
		  <div className="chat-form min-h-screen flex items-center justify-center bg-terminal-bg">
			<div className="chat-form bg-terminal-bg p-8 rounded-lg shadow-md w-96">
			  <h1 className=" chat-form text-2xl font-bold mb-6 text-center">Join a Chat Room</h1>
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
				  />
				</div>
				<button
				  onClick={() => roomId && parseInt(roomId) > 0 && parseInt(roomId) <= 9999 && setRoomId(roomId)}
				  className="w-full bg-terminal-accent/10 text-terminal-accent py-2 px-4 rounded-md hover:bg-terminal-accent/20 focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:ring-offset-2"
				>
				  Join Room
				</button>
			  </div>
			</div>
		  </div>
		);
	  }
	
	  return <ChatRoom username={username} roomId={roomId} />;
}

function Resource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}

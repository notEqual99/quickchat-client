import { useState } from 'preact/hooks';
import './style.css';
import { UsernameForm } from '../../components/UsernameForm';

export function Home() {
	const [username, setUsername] = useState('');
	const [roomId, setRoomId] = useState('');
	const [step, setStep] = useState('room');
	
	const handleRoomSubmit = () => {
		const trimmedRoomId = roomId.trim();
		const roomNumber = parseInt(trimmedRoomId);
		
		if (!trimmedRoomId || isNaN(roomNumber) || roomNumber < 1 || roomNumber > 9999) {
			alert('Please enter a valid room number between 1 and 9999');
			return;
		}
		setStep('username');
	};

	const handleRoomKeyDown = (inputValue: string) => {
		if (!inputValue || isNaN(parseInt(inputValue)) || parseInt(inputValue) < 1 || parseInt(inputValue) > 9999) {
      alert('Please enter a valid room number between 1 and 9999');
			return;
    }
    setStep('username');
	};

	const handleUsernameSet = (newUsername) => {
		setUsername(newUsername);
		setStep('ready');
	};

	const handleJoinRoom = () => {
		window.location.href = `/chat/${roomId}?username=${username}`;
	};

	if (step === 'room') {
		return (
			<div className="chat-form min-h-screen flex items-center justify-center bg-terminal-bg">
				<div className="chat-form bg-terminal-bg p-8 rounded-lg shadow-md w-96">
					<h1 className="chat-form text-2xl font-bold mb-6 text-center">Enter Chat Room Number</h1>
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
								onChange={(e) => {
									const numericValue = e.target.value.replace(/[^0-9]/g, '');
									setRoomId(numericValue);
								}}
								className="w-full px-3 py-2 border border-terminal-accent rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-accent"
								placeholder="Enter room number"
								onKeyDown={(e) => {
									if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
										e.preventDefault();
									}
									if (e.key === 'Enter') {
                    const currentInputValue = (e.target as HTMLInputElement).value;
                    handleRoomKeyDown(currentInputValue);
									}
								}}
								onPaste={(e) => {
									e.preventDefault();
									const paste = e.clipboardData.getData('text');
									const numericPaste = paste.replace(/[^0-9]/g, '');
									setRoomId(numericPaste);
								}}
								autoFocus
							/>
						</div>
						<button
							onClick={handleRoomSubmit}
							className="w-full bg-terminal-accent/10 text-terminal-accent py-2 px-4 rounded-md hover:bg-terminal-accent/20 focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:ring-offset-2"
						>
							Continue
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (step === 'username') {
		return (
			<UsernameForm 
				onSetUsername={handleUsernameSet} 
				roomId={roomId}
				onBack={() => setStep('room')}
			/>
		);
	}

	if (step === 'ready') {
		return (
			<div className="chat-form min-h-screen flex items-center justify-center bg-terminal-bg">
				<div className="chat-form bg-terminal-bg p-8 rounded-lg shadow-md w-96">
					<h1 className="chat-form text-2xl font-bold mb-6 text-center">Ready to Join</h1>
					<div className="space-y-4 text-center">
						<div className="bg-terminal-accent/5 p-4 rounded-md">
							<p className="text-sm text-gray-600 mb-2">Room Number:</p>
							<p className="text-lg font-semibold">{roomId}</p>
							<p className="text-sm text-gray-600 mb-2 mt-4">Username:</p>
							<p className="text-lg font-semibold">{username}</p>
						</div>
						<button
							onClick={handleJoinRoom}
							className="w-full bg-terminal-accent/10 text-terminal-accent py-2 px-4 rounded-md hover:bg-terminal-accent/20 focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:ring-offset-2"
						>
							Join Chat Room
						</button>
						<button
							onClick={() => setStep('username')}
							className="w-full bg-gray-500/10 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						>
							Change Username
						</button>
					</div>
				</div>
			</div>
		);
	}
}
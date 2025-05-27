import { useState } from 'preact/hooks';

interface UsernameFormProps {
  onSetUsername: (username: string) => void;
}

export function UsernameForm({ onSetUsername }: UsernameFormProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

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
    onSetUsername(trimmedUsername);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="border border-terminal-accent p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-mono text-terminal-text mb-6 text-center">
          $ welcome_to_quickchat.sh
        </h1>
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
            className="w-full bg-terminal-accent/10 text-terminal-accent py-2 px-4 font-mono hover:bg-terminal-accent/20 focus:outline-none focus:ring-1 focus:ring-terminal-accent"
          >
            $ ./start_chat
          </button>
        </form>
      </div>
    </div>
  );
}

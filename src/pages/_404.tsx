export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
      <div className="border border-terminal-accent p-8 rounded-lg w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="ml-4 text-terminal-accent text-lg">404 — Not Found</div>
        </div>
        
        <div className="font-mono text-terminal-text">
          <p className="text-terminal-accent">$ <span className="text-terminal-text">error 404: page not found</span></p>
          <p className="mt-4">The requested URL was not found on this server.</p>
          <p className="mt-2">Available commands:</p>
          <ul className="list-disc pl-6 mt-2 text-terminal-text/80">
            <li>Go back to <a href="/" className="text-terminal-accent hover:underline">homepage</a></li>
            <li>Check the URL for typos</li>
            <li>Or try again later</li>
          </ul>
          <div className="mt-6 text-sm text-terminal-text/50">
            <p>// Tip: Make sure you have the correct permissions</p>
            <p>// Status: 404 - Not Found</p>
          </div>
        </div>
      </div>
    </div>
  );
}

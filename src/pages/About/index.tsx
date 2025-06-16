import { h } from 'preact';

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      
      <div className="relative z-10 max-w-4xl w-full bg-black/90 border border-terminal-accent/30 p-8 rounded-lg shadow-lg shadow-green-400/10">
        <h1 className="text-3xl font-mono text-terminal-text mb-6 border-b border-terminal-accent/30 pb-3">
          $ about_quickchat.sh
        </h1>
        
        <div className="space-y-6 font-mono">
          <div className="space-y-4">
            <p className="text-lg text-terminal-text">
              <span>$</span> QuickChat - Secure Real-time Messaging
            </p>
            <p className="text-lg text-terminal-text">
              <span>&gt;</span> Version 1.0.0
            </p>
            <p className="text-lg text-terminal-text">
              <span>&gt;</span> Built with modern web technologies
            </p>
          </div>
          
          <div className="pt-4 border-t border-green-400/30">
            <h2 className="text-xl text-terminal-text mb-3">Features</h2>
            <ul className="space-y-2 text-terminal-text">
              {[
                'End-to-end encrypted messaging',
                'Real-time message delivery',
                'Minimalist terminal interface',
                'No data collection',
                'Open source'
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">$</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t border-green-400/30">
            <h2 className="text-xl text-terminal-text mb-3">Technologies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Preact',
                'TypeScript',
                'Tailwind CSS',
                'WebSockets',
                'Vite',
                'ESLint',
                'Prettier'
              ].map((tech) => (
                <div key={tech} className="flex items-center text-terminal-text">
                  <span className="mr-2 text-terminal-text">&gt;</span>
                  {tech}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-green-400/30">
            <a
              href="/"
              className="inline-block px-4 py-2 bg-terminal-accent/10 border border-terminal-accent hover:bg-green-400/20 transition-colors font-mono"
            >
              $ cd ..
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

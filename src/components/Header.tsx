import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

export function Header() {
  const { url } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Auto-expand when resizing to desktop
      if (!mobile && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    if (isMobile) {  // Only allow toggling on mobile
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <header className={isCollapsed ? 'collapsed' : ''}>
      <button 
        className="toggle-btn" 
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? '▶' : '◀'}
      </button>
      <nav>
        <a href="/" class={url === '/' ? 'active' : ''}>
          {!isCollapsed && <span className="nav-text">Home</span>}
        </a>
        <a href="/about" class={url === '/about' ? 'active' : ''}>
          {!isCollapsed && <span className="nav-text">About</span>}
        </a>
      </nav>
    </header>
  );
}

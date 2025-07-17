import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';
import { ChatRoom } from "../../components/ChatRoom";
import { NotFound } from "../_404";

export function Chat() {
    const location = useLocation();
    const roomIdStr = location.path.split('/').pop() || 'default-room';
    const roomId = Number(roomIdStr);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        
        const handlePopState = () => {
            window.location.href = '/';
        };

        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    if (!Number.isInteger(roomId) || roomId < 1 || roomId > 9999) {
        return <NotFound />;
    }
    
    const searchParams = new URLSearchParams(window.location.search);
    const username = searchParams.get('username');

    if (!username || username.trim() === "") {
        return <NotFound />;
    }
    
    return <ChatRoom username={username} roomId={roomIdStr} />;
}
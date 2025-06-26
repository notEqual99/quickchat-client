import { useLocation } from 'preact-iso';
import { ChatRoom } from "../../components/ChatRoom";

export function Chat() {
    const location = useLocation();
    const roomId = location.path.split('/').pop() || 'default-room';
    
    const searchParams = new URLSearchParams(window.location.search);
    const username = searchParams.get('username') || 'Guest';;
    
    return <ChatRoom username={username} roomId={roomId} />;
}
import { useLocation } from 'preact-iso';
import { ChatRoom } from "../../components/ChatRoom";
import { NotFound } from "../_404";

export function Chat() {
    const location = useLocation();
    const roomIdStr = location.path.split('/').pop() || 'default-room';
    const roomId = Number(roomIdStr);

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
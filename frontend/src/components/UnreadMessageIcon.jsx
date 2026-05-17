import { useEffect } from "react";
import { MessageCircleMore } from "lucide-react";
import { useGetUnreadMessagesCountQuery } from "../redux/api/messageApi";
import { socket } from "../socket";

const UnreadMessageIcon = () => {
    const { data, isLoading, refetch } = useGetUnreadMessagesCountQuery();
    const totalUnreadCount = data?.totalUnreadCount || 0;

    // Re-fetch unread count whenever ANY new message arrives via socket.
    // This covers messages in conversations that are NOT currently open.
    useEffect(() => {
        const handleMessage = () => {
            refetch();
        };

        socket.on("getMessage", handleMessage);

        return () => {
            socket.off("getMessage", handleMessage);
        };
    }, [refetch]);

    return (
        <button className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10 backdrop-blur-md">
            <MessageCircleMore size={30} />
            {!isLoading && totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-semibold shadow-lg border-2 border-black">
                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                </span>
            )}
        </button>
    );
};

export default UnreadMessageIcon;
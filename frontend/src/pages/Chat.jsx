import { useState, useMemo, useEffect, useRef } from "react";
import Navbar from "../components/LoggedInNavbar";
import { useGetUserConversationsQuery } from "../redux/api/conversationApi";
import { SendHorizonal, X, MessageSquare, Search } from "lucide-react";
import { useSelector } from "react-redux";
import {
  useGetAllMessagesOfConversationQuery,
  useGetUnreadMessagesCountQuery,
  useMarkMessagesAsSeenMutation,
  useSendMessageMutation,
} from "../redux/api/messageApi";
import { socket } from "../socket";

/* Only what Tailwind can't express: font-face import, custom keyframes,
   scrollbar styling, and the asymmetric bubble border-radius             */
const minimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .font-display { font-family: 'Syne', sans-serif; }
  .font-body    { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  .animate-fade-up  { animation: fadeUp 0.32s ease both; }
  .animate-msg-in   { animation: msgIn 0.2s ease both; }

  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #e8e8e8 transparent;
  }

  /* Shimmer skeleton */
  .skel {
    border-radius: 8px;
    height: 13px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* Asymmetric bubble radius — can't express with Tailwind alone */
  .bubble-me   { border-radius: 18px 18px 4px 18px; }
  .bubble-them { border-radius: 18px 18px 18px 4px; }

  /* Online dot pulse */
  .dot-pulse { animation: pulse-dot 2s ease-in-out infinite; }
`;

/* ── Helpers ── */
const fmt = (date) =>
  date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const fmtDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const groupByDate = (messages) => {
  const out = [];
  let last = null;
  messages.forEach((msg) => {
    const label = fmtDate(msg.createdAt);
    if (label !== last) { out.push({ type: "divider", label, id: `d-${label}` }); last = label; }
    out.push({ type: "msg", ...msg });
  });
  return out;
};

/* ── Component ── */
const Chat = () => {
  const { user } = useSelector((s) => s.auth);

  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText]   = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const [searchQuery, setSearchQuery]   = useState("");

  const { data, isLoading, refetch }    = useGetUserConversationsQuery();
  const conversations = data?.conversations || [];

  const { data: messagesData, isLoading: messagesLoading } =
    useGetAllMessagesOfConversationQuery(
      { conversationId: selectedChat?._id },
      { skip: !selectedChat?._id, refetchOnMountOrArgChange: true }
    );

  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
  const [markMessagesAsSeen]                         = useMarkMessagesAsSeenMutation();
  const { refetch: refetchUnreadCount }              = useGetUnreadMessagesCountQuery();
  const messagesEndRef                               = useRef(null);

  const handleSelectChat = (conv) => { setLiveMessages([]); setSelectedChat(conv); };

  useEffect(() => {
    if (!selectedChat?._id || !messagesData?.messages) return;
    setLiveMessages([...messagesData.messages]);
  }, [messagesData?.messages, selectedChat?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  const otherUser = useMemo(() => {
    if (!selectedChat) return null;
    return selectedChat.members.find((m) => m._id !== user._id);
  }, [selectedChat, user]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((conv) => {
      const other = conv.members.find((m) => m._id !== user._id);
      return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    try {
      const res = await sendMessage({ conversationId: selectedChat._id, text: messageText }).unwrap();
      setLiveMessages((prev) => [...prev, res.message]);
      socket.emit("sendMessage", {
        conversationId: selectedChat._id,
        senderId: user._id,
        receiverId: otherUser._id,
        text: messageText,
      });
      setMessageText("");
    } catch (err) { console.log(err); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSendMessage(); };

  useEffect(() => { refetch(); }, []);

  useEffect(() => {
    if (!selectedChat?._id) return;
    markMessagesAsSeen({ conversationId: selectedChat._id })
      .unwrap()
      .then(() => refetch())
      .catch(console.log);
  }, [selectedChat]);

  useEffect(() => {
    const handleMessage = (data) => {
      if (data.conversationId === selectedChat?._id) {
        setLiveMessages((prev) => [...prev, {
          _id: Date.now(), text: data.text,
          senderId: { _id: data.senderId }, createdAt: new Date(),
        }]);
      }
      refetchUnreadCount();
      refetch();
    };
    socket.on("getMessage", handleMessage);
    return () => socket.off("getMessage", handleMessage);
  }, [selectedChat]);

  const grouped  = useMemo(() => groupByDate(liveMessages), [liveMessages]);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <style>{minimalStyles}</style>

      <div className="font-body h-dvh flex flex-col bg-zinc-50 overflow-hidden text-zinc-900">
        <Navbar />

        <div className="flex flex-1 overflow-hidden p-3 gap-2.5 relative">

          {/* ── SIDEBAR ── */}
          <div className={`
            flex-shrink-0 w-[300px] bg-white rounded-2xl flex flex-col overflow-hidden
            shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]
            animate-fade-up
            ${selectedChat && isMobile ? "hidden" : "flex"}
            max-md:absolute max-md:inset-0 max-md:w-full max-md:rounded-none max-md:z-10
            md:relative md:flex
          `}>

            {/* Sidebar header */}
            <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
              <h2 className="font-display text-[17px] font-700 tracking-tight text-zinc-900 mb-3">
                Messages
              </h2>
              {/* <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations…"
                  className="
                    w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px]
                    text-zinc-900 placeholder:text-zinc-400 outline-none
                    focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/6
                    transition-all duration-150
                  "
                />
              </div> */}
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-11 h-11 rounded-full bg-zinc-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skel w-2/5" />
                      <div className="skel w-3/4" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <p className="text-center text-[13px] text-zinc-400 py-8">No conversations found</p>
              ) : (
                filtered.map((conv) => {
                  const other    = conv.members.find((m) => m._id !== user._id);
                  const isActive = selectedChat?._id === conv._id;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectChat(conv)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                        ${isActive
                          ? "bg-zinc-900 shadow-sm"
                          : "hover:bg-zinc-50"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={other?.profileImage || "https://via.placeholder.com/44"}
                          alt={other?.name}
                          className={`w-11 h-11 rounded-full object-cover ${isActive ? "ring-2 ring-white/25" : ""}`}
                        />
                        <span className={`
                          absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2
                          ${isActive ? "border-zinc-900" : "border-white"}
                        `} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-display text-[13.5px] font-semibold tracking-tight truncate ${isActive ? "text-white" : "text-zinc-900"}`}>
                          {other?.name}
                        </p>
                        <p className={`text-[12px] truncate mt-0.5 ${isActive ? "text-white/50" : "text-zinc-400"}`}>
                          {conv.lastMessage?.text || "Say hello 👋"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── CHAT PANEL ── */}
          <div className={`
            flex-1 bg-white rounded-2xl flex flex-col overflow-hidden
            shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]
            animate-fade-up [animation-delay:40ms]
            ${!selectedChat && isMobile ? "hidden" : "flex"}
            max-md:absolute max-md:inset-0 max-md:rounded-none max-md:z-20
            md:relative md:flex
          `}>

            {/* Header */}
            {selectedChat ? (
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-zinc-100 bg-white">
                {/* Mobile back */}
                <button
                  onClick={() => handleSelectChat(null)}
                  className="
                    md:hidden flex items-center justify-center w-9 h-9 rounded-full
                    border border-zinc-200 text-zinc-700 hover:bg-zinc-50
                    transition-colors duration-150 flex-shrink-0
                  "
                >
                  <X size={15} />
                </button>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={otherUser?.profileImage || "https://via.placeholder.com/42"}
                    alt={otherUser?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[14.5px] font-bold tracking-tight text-zinc-900 truncate">
                    {otherUser?.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    <span className="text-[11.5px] text-green-500 font-medium">Active now</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[73px] border-b border-zinc-100" />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 flex flex-col gap-1.5 bg-white">
              {!selectedChat ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400 h-full">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                    <MessageSquare size={26} className="text-zinc-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-display text-[15px] font-semibold text-zinc-700 tracking-tight">No chat selected</p>
                    <p className="text-[13px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                      Pick a conversation to start messaging
                    </p>
                  </div>
                </div>
              ) : messagesLoading ? (
                [80, 140, 100, 160].map((w, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-msg-in`}>
                    <div className="rounded-2xl px-4 py-3 bg-zinc-50" style={{ width: w }}>
                      <div className="skel w-full" />
                    </div>
                  </div>
                ))
              ) : (
                grouped.map((item) =>
                  item.type === "divider" ? (
                    <div key={item.id} className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-zinc-100" />
                      <span className="text-[10.5px] uppercase tracking-widest text-zinc-400 font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                      <div className="flex-1 h-px bg-zinc-100" />
                    </div>
                  ) : (
                    <div
                      key={item._id}
                      className={`flex animate-msg-in ${item.senderId._id === user._id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[68%] px-4 py-2.5 text-[13.5px] leading-relaxed break-words
                          ${item.senderId._id === user._id
                            ? "bg-zinc-900 text-white bubble-me"
                            : "bg-zinc-50 text-zinc-900 border border-zinc-100 bubble-them"
                          }
                        `}
                      >
                        {item.text}
                        <span className={`block text-[10px] mt-1 text-right ${
                          item.senderId._id === user._id ? "text-white/40" : "text-zinc-400"
                        }`}>
                          {fmt(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedChat && (
              <div className="px-4 py-3.5 border-t border-zinc-100 bg-white flex items-center gap-2.5">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="
                    flex-1 h-11 px-5 rounded-full border border-zinc-200 bg-zinc-50
                    text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none
                    focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/6
                    transition-all duration-150
                  "
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="
                    w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center
                    flex-shrink-0 shadow-md hover:bg-zinc-700 hover:scale-105 hover:shadow-lg
                    active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                    transition-all duration-150
                  "
                >
                  <SendHorizonal size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
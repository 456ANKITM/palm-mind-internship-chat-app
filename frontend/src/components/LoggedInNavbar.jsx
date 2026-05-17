import { Menu, Search, LogOut, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UnreadMessageIcon from "./UnreadMessageIcon";
import { useLogoutMutation } from "../redux/api/authApi";
import { logoutUser } from "../redux/slices/authSlice";

/* Only what Tailwind can't do: font import + drawer keyframe */
const navMinimalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
  .font-display { font-family: 'Syne', sans-serif; }
  .font-body    { font-family: 'DM Sans', sans-serif; }

  @keyframes drawerDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-drawer { animation: drawerDown 0.2s ease both; }
`;

const Navbar = () => {
  const { user }  = useSelector((s) => s.auth);
  const [logout]  = useLogoutMutation();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    setQuery("");
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutUser());
      navigate("/");
      setOpen(false);
    } catch (err) { console.log("Logout failed:", err); }
  };

  return (
    <>
      <style>{navMinimalStyles}</style>

      <nav className="font-body sticky top-0 z-50 w-full bg-white/88 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-[1400px] mx-auto px-5 h-[62px] flex items-center gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="
              w-[38px] h-[38px] rounded-[11px] bg-zinc-900 text-white
              flex items-center justify-center font-display font-extrabold text-[17px]
              tracking-tighter shadow-md group-hover:bg-zinc-700 transition-colors duration-150
            ">
              C
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold text-zinc-900 tracking-tight">ChatFlow</span>
              <span className="text-[10.5px] text-zinc-400 mt-0.5">Messaging Platform</span>
            </div>
          </button>

          {/* ── Desktop search ── */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none transition-colors duration-150 peer-focus:text-zinc-900" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by username…"
                className="
                  peer w-full h-10 pl-9 pr-4 rounded-full border border-zinc-200 bg-zinc-50
                  text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none
                  focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/6
                  transition-all duration-150
                "
              />
            </div>
          </div>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-2.5 ml-auto flex-shrink-0">

            {/* Unread icon — always shown */}
            <UnreadMessageIcon />

            {/* Desktop: avatar + logout */}
            <img
              src={user?.profileImage}
              alt="profile"
              className="
                hidden md:block w-9 h-9 rounded-full object-cover
                border-2 border-zinc-200 hover:border-zinc-900
                cursor-pointer transition-colors duration-150
              "
            />

            <button
              onClick={handleLogout}
              className="
                hidden md:flex items-center gap-2 h-[38px] px-4 rounded-full
                bg-zinc-900 text-white text-[13.5px] font-medium
                hover:bg-zinc-700 hover:-translate-y-px hover:shadow-lg
                active:translate-y-0 shadow-md
                transition-all duration-150 whitespace-nowrap
              "
            >
              <LogOut size={14} />
              Logout
            </button>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="
                md:hidden flex items-center justify-center w-[38px] h-[38px] rounded-[10px]
                border border-zinc-200 text-zinc-700
                hover:bg-zinc-50 hover:border-zinc-300
                transition-colors duration-150
              "
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {open && (
          <div className="animate-drawer md:hidden border-t border-zinc-100 bg-white px-5 py-4 flex flex-col gap-3.5">

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by username…"
                className="
                  w-full h-10 pl-9 pr-4 rounded-full border border-zinc-200 bg-zinc-50
                  text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none
                  focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/6
                  transition-all duration-150
                "
              />
            </div>

            {/* Profile row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={user?.profileImage}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-zinc-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-[13.5px] font-semibold text-zinc-900 tracking-tight truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11.5px] text-zinc-400 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2 flex-shrink-0 h-[38px] px-4 rounded-full
                  bg-zinc-900 text-white text-[13px] font-medium
                  hover:bg-zinc-700 transition-colors duration-150
                "
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
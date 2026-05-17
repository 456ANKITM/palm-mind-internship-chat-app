import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"


const Navbar = () => {
    const navigate = useNavigate()
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
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

          {/* Right: Desktop Signup */}
          <div className="flex items-center gap-4">
            <button onClick={()=>navigate("/signup")} className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition">
              Sign Up
            </button>
          </div>

          
        </div>
      </div>

    </header>
  );
};

export default Navbar;

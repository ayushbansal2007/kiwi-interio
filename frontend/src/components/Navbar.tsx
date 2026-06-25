import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar(): ReactElement {
  const token: string | null = localStorage.getItem("token");
  const location = useLocation();

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      {/* ==========================================
          🔝 TOP HEADER BAR (Logo Area)
         ========================================== */}
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 md:py-4 flex items-center justify-between">
          
          <div className="md:hidden w-10"></div>

          <div className="flex items-center justify-center md:justify-start flex-1 md:flex-initial">
            <Link to="/">
              <img
                src="https://www.kiwiinterio.com/images/logo-kiwi-1.png"
                alt="Kiwi Logo"
                className="w-28 h-14 md:w-36 md:h-16 object-contain"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link to="/" className={`hover:text-red-500 transition ${location.pathname === "/" ? "text-red-500 font-semibold" : ""}`}>
              Home
            </Link>
            <Link to="/interiors" className={`hover:text-red-500 transition ${location.pathname === "/interiors" ? "text-red-500 font-semibold" : ""}`}>
              Interiors
            </Link>
            <Link to="/about" className={`hover:text-red-500 transition ${location.pathname === "/about" ? "text-red-500 font-semibold" : ""}`}>
              About
            </Link>
            <Link to="/ai-assistant" className={`hover:text-red-500 transition ${location.pathname === "/ai-assistant" ? "text-red-500 font-semibold" : ""}`}>
              AI Assistant
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!token ? (
              <>
                <Link to="/login" className="text-gray-600 font-medium hover:text-red-500 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm hover:shadow-md transition duration-200">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="text-gray-600 font-medium hover:text-red-500 transition">
                  Profile
                </Link>
                <Link to="/admin" className="text-gray-600 font-medium hover:text-red-500 transition">
                  Admin
                </Link>
                <button onClick={handleLogout} className="bg-gray-900 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm transition duration-200">
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden w-10"></div>
        </div>
      </nav>

      {/* ==========================================
          📱 MODERN BOTTOM NAVIGATION BAR (Mobile View Only)
         ========================================== */}
      {/* 🟢 FIXED: z-50 lagaya taaki kisi bhi content ke upar rahe */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-50 rounded-t-xl px-1 py-2 flex items-center justify-around text-[10px] font-medium text-gray-500">
        
        <Link to="/" className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${location.pathname === "/" ? "text-red-500 font-bold bg-red-50" : ""}`}>
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </Link>

        <Link to="/interiors" className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${location.pathname === "/interiors" ? "text-red-500 font-bold bg-red-50" : ""}`}>
          <span className="text-lg">🖼️</span>
          <span>Interiors</span>
        </Link>

        <Link to="/ai-assistant" className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${location.pathname === "/ai-assistant" ? "text-red-500 font-bold bg-red-50" : ""}`}>
          <span className="text-lg">🤖</span>
          <span>AI Bot</span>
        </Link>

        {/* 🟢 FIXED: Mobile view mein agar user logged in nahi hai, to "/login" par bhejenge par text "Join Us" ya "Account" dikhayenge, aur register route ko bhi sync rakhenge */}
        {!token ? (
          <Link 
            to="/login" 
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${location.pathname === "/login" || location.pathname === "/register" ? "text-red-500 font-bold bg-red-50" : ""}`}
          >
            <span className="text-lg">👤</span>
            <span>Join Us</span> {/* 👈 Isme login/register dono cover ho jayenge user click karke switch kar sakta hai */}
          </Link>
        ) : (
          <Link to="/admin" className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${location.pathname === "/admin" || location.pathname === "/profile" ? "text-red-500 font-bold bg-red-50" : ""}`}>
            <span className="text-lg">⚙️</span>
            <span>Admin</span>
          </Link>
        )}
        
        {token && (
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 py-1 px-2.5 text-gray-400 hover:text-red-600">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </>
  );
}
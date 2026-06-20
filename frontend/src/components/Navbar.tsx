import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://www.kiwiinterio.com/images/logo-kiwi-1.png"
            alt="Kiwi Logo"
            className="w-40 h-20 object-contain"
          />

          
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          <Link to="/" className="hover:text-red-500 transition">
            Home
          </Link>

          <Link to="/interiors" className="hover:text-red-500 transition">
            Interiors
          </Link>

          <Link to="/about" className="hover:text-red-500 transition">
            About
          </Link>

          <Link to="/ai-assistant" className="hover:text-red-500 transition">
            AI Assistant
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-red-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-md"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-red-500"
              >
                Profile
              </Link>

              <Link
                to="/admin"
                className="text-gray-700 hover:text-red-500"
              >
                Admin
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-md"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
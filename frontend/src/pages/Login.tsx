import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import WelcomePopup from "../components/WelcomePopup";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { loginUser } from "../services/authService";
import useAuth from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Login | Kiwi Interio");
  const navigate = useNavigate();
   const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);

  try {
    const data = await loginUser(email.trim(), password);

    if (data.accessToken) {
      login(data.accessToken, data.user);

      setShowPopup(true);

      setTimeout(() => {
        navigate("/");
      }, 2500);
    } else {
      alert(data.message || "Invalid Email or Password");
    }
  } catch (error) {
    console.log(error);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
};
  return (
    // 🟢 FIXED: Mobile viewport height clamp kiya aur automatic alignment handle ki taaki keyboard layout collapse na kare
    <div className="min-h-[calc(100vh-60px)] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/60 px-4 sm:px-6 py-8 relative overflow-hidden">
      
      {/* Premium Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-red-400/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-orange-400/10 blur-[80px] pointer-events-none" />

      {/* Main Glassmorphism Card Container */}
      {/* 🟢 FIXED: Card ko mobile par `w-full` aur full center space di hai taaki screen khulte hi sabse pehle saamne chamke */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-6 sm:p-10 rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-red-900/5 w-full max-w-[420px] transition-all duration-300 transform scale-100 z-10">
        
        {/* Branding Head */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-red-500 to-red-600 text-white p-3.5 rounded-[22px] mb-4 shadow-lg shadow-red-500/20">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
            Log in to manage your premium spaces
          </p>
        </div>

        {/* Core Form Area */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Input Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-gray-50/50 border border-gray-200 focus:border-red-500 focus:bg-white pl-11 pr-4 py-3 sm:py-3.5 rounded-xl outline-none text-sm text-gray-800 transition-all duration-200 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-200 focus:border-red-500 focus:bg-white pl-11 pr-4 py-3 sm:py-3.5 rounded-xl outline-none text-sm text-gray-800 transition-all duration-200 shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Forgot Password Link Element (Optional Aesthetic Layout) */}
          <div className="flex justify-end pr-1">
            <a href="#forgot" className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* CTA Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-900 to-stone-900 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-widest py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Form Footer Switcher */}
        <div className="text-center mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-red-500 hover:text-red-600 transition-colors ml-1">
              Register Here
            </Link>
          </p>
        </div>
      </div>

      {/* Welcome Popup Trigger Handle */}
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </div>
  );
}

export default Login;
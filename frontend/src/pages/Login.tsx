import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import WelcomePopup from "../components/WelcomePopup";
import GoogleLoginButton from "../components/GoogleLoginButton";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { loginUser, loginWithGoogle } from "../services/authService";
import useAuth from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useDocumentTitle("Login | Kiwi Interio");
  const navigate = useNavigate();
  const { login } = useAuth();

  const completeLogin = (data: {
    accessToken?: string;
    refreshToken?: string;
    user?: Parameters<typeof login>[1];
    message?: string;
  }) => {
    if (!data.accessToken || !data.user) {
      throw new Error(data.message || "Invalid email or password");
    }

    login(data.accessToken, data.user, data.refreshToken);
    setShowPopup(true);

    setTimeout(() => {
      navigate("/profile");
    }, 1800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email.trim(), password);
      completeLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await loginWithGoogle(credential);
      completeLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] border border-neutral-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden bg-neutral-950 px-8 py-10 text-white">
          <div className="absolute -left-14 top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-orange-300/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
              <Sparkles size={12} />
              Kiwi Interio
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.07em] sm:text-5xl">
              Welcome back to your design workspace.
            </h1>

          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Sign in</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-neutral-950">Log in to continue.</h2>

          <div className="mt-6 space-y-4">
            <GoogleLoginButton
              disabled={loading}
              onSuccess={handleGoogleLogin}
              onError={setError}
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">or email</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3">
                <Mail size={16} className="text-neutral-400" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-sm outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3">
                <Lock size={16} className="text-neutral-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            {error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Secure sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-5 text-sm text-neutral-500">
            New here?{" "}
            <Link to="/register" className="font-bold text-red-600">
              Create account
            </Link>
          </p>
        </div>
      </div>

      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </div>
  );
}

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Phone, Sparkles, UserRound } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { registerUser } from "../services/authService";
import useAuth from "../hooks/useAuth";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { loginWithGoogle } from "../services/authService";

const fieldConfig = [
  { key: "name", label: "Full name", icon: UserRound, type: "text" },
  { key: "email", label: "Email address", icon: Mail, type: "email" },
  { key: "number", label: "Phone number", icon: Phone, type: "text" },
] as const;

function Register() {
  useDocumentTitle("Register | Kiwi Interio");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: keyof typeof formData, value: string) =>
    setFormData((current) => ({ ...current, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await registerUser(formData);
      if (!data.accessToken || !data.user) {
        throw new Error(data.message || "Registration failed");
      }

      login(data.accessToken, data.user, data.refreshToken);
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] border border-neutral-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-neutral-950 px-8 py-10 text-white">
          <div className="absolute -left-14 top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-orange-300/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
              <Sparkles size={12} />
              Join Kiwi
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.07em] sm:text-5xl">Create your premium interior account.</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-neutral-300">
              Save favorite spaces, build your cart, complete checkout and track orders from one profile dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Create account</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-neutral-950">Start your design journey.</h2>

          <div className="mt-8 grid gap-4">
            <GoogleLoginButton
              disabled={loading}
              onSuccess={async (credential) => {
                setLoading(true);
                setError("");
                try {
                  const data = await loginWithGoogle(credential);
                  if (!data.accessToken || !data.user) {
                    throw new Error(data.message || "Google sign-in failed");
                  }
                  login(data.accessToken, data.user, data.refreshToken);
                  navigate("/profile");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Google sign-in failed");
                } finally {
                  setLoading(false);
                }
              }}
              onError={setError}
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">or email</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {fieldConfig.map(({ key, label, icon: Icon, type }) => (
              <label key={key} className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3">
                  <Icon size={16} className="text-neutral-400" />
                  <input
                    required
                    type={type}
                    value={formData[key]}
                    onChange={(event) => handleChange(key, event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">Password</span>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(event) => handleChange("password", event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>

          {error && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50">
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight size={16} />
          </button>

          <p className="mt-5 text-sm text-neutral-500">
            Already have an account? <Link to="/login" className="font-bold text-red-600">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

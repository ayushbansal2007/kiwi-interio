import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Phone,
  UserRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Palette,
  CheckCircle2,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { updateProfile } from "../services/authService";

function CompleteProfile() {
  useDocumentTitle("Complete Profile | Kiwi Interio");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, accessToken, loading, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [number, setNumber] = useState(user?.number || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const redirectTo = params.get("redirect") || "/profile";

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!number && user.number) setNumber(user.number);
    }
  }, [user]);

  // If user is not logged in and auth finished loading, redirect to login
  useEffect(() => {
    if (!loading && !accessToken) {
      navigate("/login", { replace: true });
    }
  }, [loading, accessToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedNumber = number.replace(/\D/g, "");
    if (!cleanedNumber || cleanedNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!accessToken) {
      setError("You must be logged in to update your profile");
      return;
    }

    setSubmitting(true);

    try {
      const response = await updateProfile(accessToken, {
        name: name.trim() || user?.name || "Kiwi User",
        number: cleanedNumber,
      });

      if (!response.success && response.message) {
        throw new Error(response.message);
      }

      // Update AuthContext state reactively
      updateUser({
        name: name.trim() || user?.name,
        number: cleanedNumber,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate(redirectTo, { replace: true });
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffcf8]">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[36px] border border-neutral-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Side: Kiwi Branding & Feature Perks */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-neutral-950 px-8 py-10 text-white">
          <div className="absolute -left-14 top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-orange-300/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
              <Sparkles size={12} />
              Almost Done!
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.06em] sm:text-4xl">
              Complete your profile setup.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-300">
              Add your contact number to unlock personalized interior design consultations, direct tracking, and instant updates.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-600/20 text-red-300">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Order & Delivery Updates</h4>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Get real-time SMS & WhatsApp alerts when your custom pieces ship.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/20 text-orange-300">
                  <Palette size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Designer Consultations</h4>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Connect with our certified interior architects directly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">100% Privacy Protected</h4>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Your number is strictly used for orders and consultations. No spam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 pt-6 border-t border-white/10 text-xs text-neutral-400">
            Signed in as <span className="font-semibold text-white">{user?.email}</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
                  One Quick Step
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-neutral-950 sm:text-3xl">
                  Add your contact details
                </h2>
              </div>

              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-red-100 shadow-md"
                />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-950 text-white shadow-md">
                  <UserRound size={24} />
                </div>
              )}
            </div>

            {success ? (
              <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-4 text-lg font-black text-emerald-950">
                  Profile updated successfully!
                </h3>
                <p className="mt-1 text-xs text-emerald-700">
                  Redirecting you to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Full name
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 transition focus-within:border-neutral-950 focus-within:bg-white">
                    <UserRound size={16} className="text-neutral-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ayush Bansal"
                      className="w-full bg-transparent text-sm font-semibold text-neutral-950 outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Phone number <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-400">
                      10 digits
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 transition focus-within:border-neutral-950 focus-within:bg-white">
                    <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-3 text-xs font-bold text-neutral-600">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <Phone size={16} className="text-neutral-400" />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNumber(val);
                      }}
                      placeholder="9876543210"
                      className="w-full bg-transparent text-sm font-semibold tracking-wide text-neutral-950 outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-400">
                    We'll use this number for delivery tracking and consultation calls.
                  </p>
                </label>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-neutral-950/15 transition hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? "Saving details..." : "Save & Continue"}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-5 text-xs text-neutral-500">
            <button
              type="button"
              onClick={handleSkip}
              className="font-medium text-neutral-400 transition hover:text-neutral-950"
            >
              Skip for now →
            </button>

            <Link
              to="/profile"
              className="font-bold text-red-600 hover:underline"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;

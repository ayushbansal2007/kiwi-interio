import { useEffect, useState, type ReactElement } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Bot,
  Compass,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { fetchCart } from "../services/commerceService";

export default function Navbar(): ReactElement {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartBounced, setCartBounced] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const role = user?.role?.trim().toLowerCase() || "";
  const canOpenAdminPanel = ["admin", "hr", "manager"].includes(role);

  useEffect(() => {
    let mounted = true;

    const syncCart = async () => {
      if (!user) {
        if (mounted) setCartCount(0);
        return;
      }

      try {
        const payload = await fetchCart();
        if (mounted) {
          const count = payload?.data?.itemCount || 0;
          setCartCount((prev) => {
            if (count > prev) {
              setCartBounced(true);
              setTimeout(() => setCartBounced(false), 800);
            }
            return count;
          });
        }
      } catch {
        if (mounted) setCartCount(0);
      }
    };

    const listener = () => void syncCart();
    window.addEventListener("cart-updated", listener);
    void syncCart();

    return () => {
      mounted = false;
      window.removeEventListener("cart-updated", listener);
    };
  }, [user]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Collections", path: "/interiors" },
    { label: "AI Designer", path: "/ai-assistant", icon: Bot, badge: "AI" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-[#fffcf8]/85 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="Kiwi Interio Home"
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-md shadow-neutral-950/20"
          >
            <Sparkles size={19} className="text-red-500" />
          </motion.div>
          <div>
            <span className="block text-base font-black tracking-[-0.05em] text-neutral-950">
              KIWI INTERIO<span className="text-red-600">.</span>
            </span>
            <span className="block text-[8px] font-bold tracking-[0.24em] text-neutral-400">
              LUXURY ARCHITECTURE & LIVING
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 shadow-xs backdrop-blur-md lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  isActive
                    ? "text-white"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-full bg-neutral-950 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {link.icon && <link.icon size={13} className={isActive ? "text-red-400" : "text-neutral-400"} />}
                  {link.label}
                  {link.badge && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[8px] font-black text-white">
                      {link.badge}
                    </span>
                  )}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {/* Cart Button with animated badge */}
              <Link
                to="/cart"
                className="group relative inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow-xs transition hover:border-red-200 hover:text-red-600"
              >
                <ShoppingBag size={14} className="transition group-hover:scale-110" />
                Cart
                <motion.span
                  animate={cartBounced ? { scale: [1, 1.4, 1] } : {}}
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black ${
                    cartCount > 0
                      ? "bg-red-600 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {cartCount}
                </motion.span>
              </Link>

              {/* Admin Panel Workspace Link */}
              {canOpenAdminPanel && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                >
                  <LayoutDashboard size={14} className="text-red-600" />
                  Workspace
                </Link>
              )}

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 pr-3.5 text-xs font-bold text-neutral-800 shadow-xs transition hover:border-neutral-950"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-950 text-white text-[11px] font-black">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="max-w-28 truncate">{user.name?.split(" ")[0] || "Account"}</span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
                    >
                      <div className="border-b border-neutral-100 px-3 py-2">
                        <p className="truncate text-xs font-bold text-neutral-950">{user.name}</p>
                        <p className="truncate text-[10px] text-neutral-400">{user.email}</p>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/profile?tab=overview"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          <UserRound size={14} className="text-neutral-400" />
                          Dashboard Overview
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          <Compass size={14} className="text-neutral-400" />
                          My Orders
                        </Link>
                        <Link
                          to="/profile?tab=messages"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          <Headphones size={14} className="text-red-500" />
                          Studio Live Support
                        </Link>
                        {canOpenAdminPanel && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                          >
                            <Shield size={14} className="text-neutral-400" />
                            Admin Console
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut size={14} />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:text-neutral-950"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-neutral-950/20 transition hover:-translate-y-0.5 hover:bg-red-600"
              >
                Start Designing
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-neutral-200 bg-white text-neutral-950 shadow-xs lg:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={18} /> : <Menu size={19} />}
        </button>
      </div>

      {/* Mobile Animated Slide-Down Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-neutral-100 bg-[#fffcf8] px-4 pb-6 pt-3 shadow-2xl lg:hidden"
          >
            <nav className="mx-auto grid max-w-7xl gap-1">
              <NavLink
                to="/"
                end
                className="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
              >
                Home
              </NavLink>
              <NavLink
                to="/interiors"
                className="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
              >
                Collections
              </NavLink>
              <NavLink
                to="/ai-assistant"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <Bot size={17} className="text-red-600" /> AI Designer
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">
                  Interactive
                </span>
              </NavLink>

              {user ? (
                <>
                  <div className="my-2 border-t border-neutral-200/60" />
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
                  >
                    <UserRound size={16} className="text-neutral-400" />
                    My Profile & Settings
                  </NavLink>
                  <NavLink
                    to="/cart"
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-neutral-400" />
                      Shopping Cart
                    </span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                      {cartCount}
                    </span>
                  </NavLink>
                  <NavLink
                    to="/profile?tab=messages"
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
                  >
                    <Headphones size={16} className="text-red-600" />
                    Studio Support Desk
                  </NavLink>
                  {canOpenAdminPanel && (
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-white"
                    >
                      <LayoutDashboard size={16} className="text-red-600" />
                      Admin Workspace
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-900"
                  >
                    <LogIn size={15} /> Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-red-600/30"
                  >
                    Join Kiwi
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

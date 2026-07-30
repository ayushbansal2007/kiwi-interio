import { useEffect, useState, type ReactElement } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bot, LayoutDashboard, LogIn, LogOut, Menu, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { fetchCart } from "../services/commerceService";

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `relative px-1 py-2 text-sm font-semibold transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-red-500 after:transition-transform ${
    isActive
      ? "text-neutral-950 after:scale-x-100"
      : "text-neutral-500 hover:text-neutral-950 after:scale-x-0 hover:after:scale-x-100"
  }`;

export default function Navbar(): ReactElement {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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
        if (mounted) setCartCount(payload?.data?.itemCount || 0);
      } catch (error) {
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

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[#fffcf8]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" onClick={closeMenu} aria-label="Kiwi Interio home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg shadow-neutral-950/15 transition-transform duration-300 group-hover:rotate-6">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block text-base font-black tracking-[-0.05em] text-neutral-950">KIWI INTERIO</span>
            <span className="block text-[8px] font-bold tracking-[0.22em] text-red-500">DESIGN, MADE PERSONAL</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          <NavLink to="/" end className={desktopLink}>Home</NavLink>
          <NavLink to="/interiors" className={desktopLink}>Collections</NavLink>
          <NavLink to="/ai-assistant" className={desktopLink}>AI Designer</NavLink>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-white hover:text-neutral-950">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600"><UserRound size={14} /></span>
                <span className="max-w-28 truncate">{user.name?.split(" ")[0] || "Profile"}</span>
              </Link>
              <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 transition hover:border-red-200 hover:text-red-600">
                <ShoppingBag size={14} />
                Cart
                {cartCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] text-white">{cartCount}</span>}
              </Link>
              {canOpenAdminPanel && <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"><LayoutDashboard size={14} /> Workspace</Link>}
              <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600"><LogOut size={14} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950">Log in</Link>
              <Link to="/register" className="rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-neutral-950/15 transition hover:-translate-y-0.5 hover:bg-red-600">Start designing</Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950 lg:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation">
          {menuOpen ? <X size={19} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-100 bg-[#fffcf8] px-4 pb-5 pt-4 shadow-xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
            <NavLink to="/" end onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white">Home</NavLink>
            <NavLink to="/interiors" onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white">Collections</NavLink>
            <NavLink to="/ai-assistant" onClick={closeMenu} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white"><Bot size={16} /> AI Designer</NavLink>
            {user ? (
              <>
                <NavLink to="/profile" onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white">My profile</NavLink>
                <NavLink to="/cart" onClick={closeMenu} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white"><span>Cart</span><span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">{cartCount}</span></NavLink>
                {canOpenAdminPanel && <NavLink to="/admin" onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-white">Team workspace</NavLink>}
                <button onClick={handleLogout} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-sm font-bold text-white"><LogOut size={16} /> Logout</button>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900"><LogIn size={16} /> Log in</Link>
                <Link to="/register" onClick={closeMenu} className="flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white">Join Kiwi</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

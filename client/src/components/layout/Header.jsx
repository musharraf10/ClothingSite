import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiMoon, HiSun } from "react-icons/hi";
import { logout } from "../../store/slices/authSlice.js";
import { MobileNavigation } from "./MobileNavigation.jsx";
import { useTheme } from "../../hooks/useTheme.js";

function IconSearch() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M4 20a8 8 0 0116 0" strokeLinecap="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const location = useLocation();
  const cartCount = useSelector((s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0));
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [stage, setStage] = useState("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("expand"), 400);
    const t2 = setTimeout(() => setStage("brand"), 900);
    const t3 = setTimeout(() => setStage("nav"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (isAdminRoute) return null;

  return (
    <>
      <div className="relative h-24 md:h-28">
        <div className="absolute top-0 left-0 right-0 z-[9999] flex justify-center pt-6 pointer-events-none">
          <motion.div
            className="pointer-events-auto flex items-center justify-center gap-4 rounded-full border border-border bg-card/70 text-fg backdrop-blur-xl px-4 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.25)]"
            initial={{ width: 100 }}
            animate={{
              width:
                stage === "logo"
                  ? 100
                  : stage === "expand"
                    ? 260
                    : stage === "brand"
                      ? 360
                      : 1000,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence>
              {stage === "nav" && (
                <motion.nav className="flex items-center gap-4 flex-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Link className="text-xs tracking-widest uppercase" to="/">Home</Link>
                  <Link className="text-xs tracking-widest uppercase" to="/shop">Collection</Link>
                  <Link className="text-xs tracking-widest uppercase" to="/support">Contact</Link>

                </motion.nav>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center justify-center leading-none">
              <motion.div className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center font-semibold shadow-md" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                M
              </motion.div>
              <motion.div
                className="overflow-hidden whitespace-nowrap text-[9px] tracking-[0.35em] mt-1 opacity-80"
                initial={{ opacity: 0, y: 6 }}
                animate={stage === "brand" || stage === "nav" ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.5 }}
              >
                MADVIRA
              </motion.div>
            </div>

            <AnimatePresence>
              {stage === "nav" && (
                <motion.div className="flex items-center gap-2 flex-1 justify-end" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <button onClick={() => navigate("/search")} className="w-10 h-10 flex items-center justify-center">
                    <IconSearch />
                  </button>
                  <button onClick={() => navigate(user ? "/account" : "/auth")} className="w-10 h-10 flex items-center justify-center">
                    <IconUser />
                  </button>
                  <button onClick={() => navigate("/cart")} className="w-10 h-10 flex items-center justify-center relative">
                    <IconBag />
                    <span className="absolute top-1 right-1 text-[10px] bg-accent text-primary rounded-full px-1">
                      {cartCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center justify-center rounded-full border border-border p-1.5"
                    title={theme === "dark" ? "Switch to light" : "Switch to dark"}
                  >
                    {theme === "dark" ? <HiSun className="w-3.5 h-3.5" /> : <HiMoon className="w-3.5 h-3.5" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <MobileNavigation />
    </>
  );
}
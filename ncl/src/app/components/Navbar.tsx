import { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import { HorizontalLockupSVG } from "./BrandLogo";

const navLinks = [
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Location", to: "/location" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(4,4,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(124,58,237,0.18)" : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-18 py-4" aria-label="Main navigation">
        {/* Logo — Primary horizontal lockup */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center select-none shrink-0"
          aria-label="NEXYRA Consulting — go to homepage"
        >
          <HorizontalLockupSVG width={185} variant="gradient" />
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-[#8888bb] hover:text-[#e8e8ff]"
                  }`
                }
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/contact"
            className="text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#8888bb] hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ background: "rgba(4,4,15,0.97)", borderBottom: "1px solid rgba(124,58,237,0.18)" }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-base py-2 border-b transition-colors duration-200 ${
                  isActive
                    ? "text-white border-[rgba(124,58,237,0.4)]"
                    : "text-[#8888bb] border-[rgba(124,58,237,0.12)] hover:text-white"
                }`
              }
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 text-center text-sm px-5 py-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            Book a Call
          </Link>
        </div>
      )}
    </header>
  );
}

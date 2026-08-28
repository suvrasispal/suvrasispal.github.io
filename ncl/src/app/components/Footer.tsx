import { Link, useLocation, useNavigate } from "react-router";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import { NMonogramSVG } from "./BrandLogo";

const footerLinks = {
  Company: [
    { label: "About", to: "/about" },
    { label: "Work", to: "/work" },
    { label: "Services", to: "/services" },
    { label: "Pricing", to: "/pricing" },
    { label: "Location", to: "/location" },
    { label: "Contact", to: "/contact" },
  ],
  Services: [
    { label: "UI/UX Product Design", to: "/services" },
    { label: "SaaS Product Design", to: "/services" },
    { label: "Enterprise Software Design", to: "/services" },
    { label: "Brand Design System", to: "/services" },
    { label: "Visual Identity & Branding", to: "/services" },
    { label: "Web & Landing Page Design", to: "/services" },
    { label: "Mobile App Design", to: "/services" },
    { label: "E-commerce Design", to: "/services" },
    { label: "Motion Graphic Design", to: "/services" },
    {
      label: "Print, Merchandise & Packaging",
      to: "/services",
    },
    {
      label: "Infographic & Data Visualization",
      to: "/services",
    },
    {
      label: "Pitch Deck & Presentation Design",
      to: "/services",
    },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/contact" },
    { label: "Terms & Conditions", to: "/contact" },
    { label: "Refund Policy", to: "/contact" },
  ],
};

export function Footer() {
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

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(124,58,237,0.18)",
        background: "#020209",
        fontFamily: "'DM Sans', sans-serif",
      }}
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
          {/* Brand col — N monogram as defined in Brand Book footer guidance */}
          <div className="lg:col-span-2">
            <a
              href="/"
              onClick={handleLogoClick}
              aria-label="NEXYRA Consulting homepage"
              className="inline-flex items-center"
            >
              <NMonogramSVG size={52} variant="gradient" />
            </a>
            <p
              className="mt-4 text-sm leading-relaxed max-w-xs"
              style={{ color: "#8888bb" }}
            >
              Your dedicated design partner — bold strategy,
              refined execution, limitless creative vision for
              brands that refuse to be ordinary.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="mailto:hello@nexyraconsulting.co.uk"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                style={{ color: "#8888bb" }}
              >
                <Mail size={14} />
                hello@nexyraconsulting.co.uk
              </a>
              <a
                href="tel:+447415171157"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                style={{ color: "#8888bb" }}
              >
                <Phone size={14} />
                +44 74151 71157
              </a>
              <span
                className="flex items-start gap-2 text-sm"
                style={{ color: "#8888bb" }}
              >
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>Slough, Berkshire, UK</span>
              </span>
            </div>
            <div className="mt-6 flex gap-4">
              {[
                {
                  Icon: Linkedin,
                  label: "LinkedIn",
                  href: "#",
                },
                {
                  Icon: Twitter,
                  label: "Twitter / X",
                  href: "#",
                },
                {
                  Icon: Instagram,
                  label: "Instagram",
                  href: "#",
                },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:border-[#7c3aed] hover:text-white"
                  style={{
                    borderColor: "rgba(124,58,237,0.25)",
                    color: "#8888bb",
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3
                className="text-xs uppercase tracking-widest mb-5"
                style={{
                  color: "#7c3aed",
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontWeight: 700,
                }}
              >
                {title}
              </h3>
              <ul className="flex flex-col gap-3" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: "#8888bb" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div
          className="rounded-2xl p-8 md:p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.1) 100%)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <div>
            <p
              className="text-lg md:text-xl"
              style={{
                color: "#e8e8ff",
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              Ready to elevate your brand?
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "#8888bb" }}
            >
              Let's build something unforgettable together.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm shrink-0 transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Start a Project <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{
            borderTop: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <p className="text-xs" style={{ color: "#555577" }}>
            © 2026 NEXYRA CONSULTING LTD. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms & Conditions"].map(
              (item) => (
                <Link
                  key={item}
                  to="/contact"
                  className="text-xs hover:text-white transition-colors"
                  style={{ color: "#555577" }}
                >
                  {item}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
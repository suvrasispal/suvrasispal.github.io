import { Outlet, useLocation } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LogoIntro } from "./LogoIntro";

const INTRO_KEY = "nexyra_intro_shown";

export function Root() {
  const { pathname } = useLocation();

  // Show intro only once per browser session, only on the home route
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem(INTRO_KEY);
    } catch {
      return false;
    }
  });

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // ignore
    }
    setShowIntro(false);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#04040f" }}
    >
      {showIntro && <LogoIntro onComplete={handleIntroComplete} />}

      {/* Page content fades in after intro */}
      <div
        style={{
          opacity: showIntro ? 0 : 1,
          transition: "opacity 0.5s ease 0.1s",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

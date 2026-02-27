import { useState, useEffect, createContext, useContext } from "react";
import { T } from './constants/translations';
import { THEMES } from './constants/themes';
import { GlobalStyle } from './styles/StyledComponents';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { AdminPanel, MapCatalog } from './components/Pages';
import { useAuth } from './context/AuthContext';

export const LangCtx = createContext({ lang: "en", t: T.en, setLang: () => {} });
export const useLang = () => useContext(LangCtx);
export const ThemeCtx = createContext({ theme: THEMES.midnight, themeKey: "midnight", setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export const fmt = n => n?.toLocaleString() ?? "—";
export const Stars = ({ v }) => (
  <span className="mono" style={{ fontSize: 12, color: "#ffb6d0", letterSpacing: 1 }}>
    ✦ {(v || 0).toFixed(2)}
  </span>
);

const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", alignItems: "center", background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
      {["en", "ru"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: "4px 12px", fontSize: 12, fontWeight: 800,
          background: lang === l ? "var(--a)" : "transparent",
          color: lang === l ? "white" : "var(--muted)",
          border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
};

const ThemeSwitcher = () => {
  const { themeKey, setTheme } = useTheme();
  const { lang } = useLang();
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Object.entries(THEMES).map(([k, th]) => (
        <button key={k} onClick={() => setTheme(k)}
          title={lang === "ru" ? th.nameRu : th.name}
          style={{
            width: 22, height: 22, borderRadius: "50%",
            border: `2px solid ${themeKey === k ? th.accent : "transparent"}`,
            background: th.gradient, cursor: "pointer", transition: "border 0.2s",
          }} />
      ))}
    </div>
  );
};

const SakuraPetals = () => {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${7 + Math.random() * 8}s`,
    size: `${12 + Math.random() * 10}px`,
    emoji: ["🌸", "🌺", "✿", "❀"][Math.floor(Math.random() * 4)],
  }));
  return (
    <>
      {petals.map(p => (
        <div key={p.id} className="sakura-petal" style={{
          left: p.left, top: "-20px",
          animationDelay: p.delay, animationDuration: p.duration,
          fontSize: p.size,
        }}>{p.emoji}</div>
      ))}
    </>
  );
};

const Topbar = ({ title, onMenu, user, onLogout }) => (
  <div style={{
    height: 58, borderBottom: "1px solid var(--border)",
    background: "rgba(7,11,20,0.85)", backdropFilter: "blur(12px)",
    display: "flex", alignItems: "center", padding: "0 24px", gap: 14,
    position: "sticky", top: 0, zIndex: 100,
  }}>
    <button onClick={onMenu} className="btn-ghost" style={{
      display: "none", padding: "6px 10px", fontSize: 16, borderRadius: 8,
    }} id="mobile-menu-btn">☰</button>

    <h1 className="syne" style={{ fontSize: 16, fontWeight: 700 }}>{title}</h1>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      <ThemeSwitcher />
      <LangToggle />
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--card2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "5px 12px", cursor: "pointer",
        }}
        onClick={onLogout}
        title="Click to Logout"
      >
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: user ? "#4ade80" : "#94a3b8",
          boxShadow: user ? "0 0 6px rgba(74,222,128,0.6)" : "none"
        }} />
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
          {user ? user.username : 'Guest'}
        </span>
        {user && <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 4 }}>Log out ↪</span>}
      </div>
    </div>
  </div>
);

const Landing = ({ onLogin }) => {
  const { t } = useLang();
  const { theme } = useTheme();
  const lt = t.landing;
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <SakuraPetals />
      <div className="orb" style={{ width: 600, height: 600, background: `radial-gradient(circle,${theme.accentDim.replace("0.07", "0.15")} 0%,transparent 70%)`, top: -200, right: -100 }} />

      <nav style={{
        position: "sticky", top: 0, zIndex: 100, padding: "0 5%",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(7,11,20,0.7)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="syne" style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
          <span className="accent-text">osu!</span><span style={{ color: "var(--text)" }}>Tracker</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <LangToggle />
          <button className="btn-accent" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 10 }}
            onClick={onLogin}>{lt.loginBtn}</button>
        </div>
      </nav>

      <section style={{ padding: "100px 5% 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h1 className="hero-title fu d1" style={{ fontSize: "clamp(3rem,7vw,6rem)", color: "var(--text)", marginBottom: 12 }}>
          {lt.hero1}<br />
          <span className="accent-text">{lt.hero2}</span>
        </h1>
        <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "var(--muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          {lt.heroSub}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-accent" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }} onClick={onLogin}>
            {lt.loginBtn}
          </button>
          <button className="btn-ghost" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }} onClick={onLogin}>
            {lt.cta}
          </button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 5%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>{lt.footer}</p>
      </footer>
    </div>
  );
};

const LoginModal = ({ onClose }) => {
  const handleLogin = () => {
    const clientID = '49185';
    const redirectUri = encodeURIComponent('https://osu-stats-experiments.vercel.app/');
    window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&scope=identify+public`;
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
      <div className="card" style={{ width: 360, padding: 28, background: "var(--card2)", borderWidth: 2 }}>
        <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>osu! Login</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, textAlign: "center" }}>
          Connect your osu! account to unlock analytics.
        </p>
        <button className="btn-accent" style={{ width: "100%", padding: "12px", fontSize: 14 }} onClick={handleLogin}>
          Authorize with osu!
        </button>
        <button className="btn-ghost" style={{ width: "100%", padding: "8px", marginTop: 16 }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const { user, logout, loading } = useAuth();

  const [lang, setLang] = useState("en");
  const [themeKey, setThemeKey] = useState("midnight");
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const theme = THEMES[themeKey];
  const t = { ...T[lang], lang };

  const titles = {
    dashboard: t.nav?.dashboard || "Dashboard",
    profile: t.nav?.profile || "Profile",
    stats: t.nav?.stats || "Statistics",
    maps: t.nav?.maps || "Maps",
    admin: t.nav?.admin || "Admin",
  };

  // Показываем спиннер пока AuthContext грузит сессию
  if (loading) {
    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <ThemeCtx.Provider value={{ theme, themeKey, setTheme: k => setThemeKey(k) }}>
          <GlobalStyle theme={theme} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ width: 48, height: 48, border: "4px solid var(--border)", borderRadius: "50%", borderTopColor: theme.accent, animation: "spin 1s linear infinite" }} />
          </div>
        </ThemeCtx.Provider>
      </LangCtx.Provider>
    );
  }

  // Не залогинен — лендинг
  if (!user) {
    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <ThemeCtx.Provider value={{ theme, themeKey, setTheme: k => setThemeKey(k) }}>
          <GlobalStyle theme={theme} />
          <div className="grid-bg" />
          <Landing onLogin={() => setShowLogin(true)} />
          {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </ThemeCtx.Provider>
      </LangCtx.Provider>
    );
  }

  // Залогинен — дашборд
  const pageMap = {
    dashboard: <Dashboard user={user} />,
    profile: <Profile user={user} />,
    stats: <Statistics user={user} />,
    maps: <MapCatalog />,
    admin: <AdminPanel />,
  };

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <ThemeCtx.Provider value={{ theme, themeKey, setTheme: k => setThemeKey(k) }}>
        <GlobalStyle theme={theme} />
        <div className="grid-bg" />
        <div className="orb" style={{ width: 500, height: 500, background: `radial-gradient(circle,${theme.accentDim.replace("0.07", "0.08")} 0%,transparent 70%)`, top: -100, right: -100 }} />
        <div className="orb" style={{ width: 300, height: 300, background: `radial-gradient(circle,${theme.amberDim} 0%,transparent 70%)`, bottom: 50, left: -100 }} />

        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

        <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
          <SakuraPetals />
          <Sidebar
            page={page}
            setPage={p => { setPage(p); setSidebarOpen(false); }}
            open={sidebarOpen}
            user={user}
          />

          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150 }} />
          )}

          <main className="mcol" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Topbar
              title={titles[page]}
              onMenu={() => setSidebarOpen(!sidebarOpen)}
              user={user}
              onLogout={logout}
            />

            {/* ГЛАВНЫЙ КОНТЕНТ */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {pageMap[page] || <Dashboard user={user} />}
            </div>
          </main>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .sidebar { position: fixed !important; }
            #mobile-menu-btn { display: flex !important; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}
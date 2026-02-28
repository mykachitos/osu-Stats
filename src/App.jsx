import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
} from "recharts";

import { T } from './constants/translations';
import { THEMES } from './constants/themes';
import { MOCK_PLAYER, RECOMMENDED_MAPS, ADMIN_USERS } from './constants/mockData';
import { GlobalStyle } from './styles/StyledComponents';
import { computeSkills, computePPTrend, recommendMaps } from './utils/helpers';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { AdminPanel, MapCatalog } from './components/Pages';
import axios from 'axios';

export const LangCtx = createContext({ lang: "en", t: T.en, setLang: () => {} });
export const useLang = () => useContext(LangCtx);

export const ThemeCtx = createContext({ theme: THEMES.midnight, themeKey: "midnight", setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
export const fmt = n => n?.toLocaleString() ?? "—";
export const Stars = ({ v }) => (
  <span className="mono" style={{fontSize:12,color:"#ffb6d0",letterSpacing:1}}>
    ✦ {v.toFixed(2)}
  </span>
);
export const Notif = ({ msg, onClose }) => {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return()=>clearTimeout(t); },[]);
  return <div className="notif">🌸 {msg}</div>;
};

const SakuraPetals = () => {
  const petals = Array.from({length:12},(_,i)=>({
    id:i,
    left:`${Math.random()*100}%`,
    delay:`${Math.random()*8}s`,
    duration:`${7+Math.random()*8}s`,
    size:`${12+Math.random()*10}px`,
    emoji: ["🌸","🌺","✿","❀"][Math.floor(Math.random()*4)],
  }));
  return (
    <>
      {petals.map(p=>(
        <div key={p.id} className="sakura-petal" style={{
          left:p.left, top:"-20px",
          animationDelay:p.delay, animationDuration:p.duration,
          fontSize:p.size,
        }}>{p.emoji}</div>
      ))}
    </>
  );
};

/* ══════════════════════════════════════════
   COMPONENTS (LANDING, TOPBAR, etc)
══════════════════════════════════════════ */
const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div style={{display:"flex",alignItems:"center", background:"var(--card2)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden"}}>
      {["en","ru"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{
          padding:"4px 12px",fontSize:12,fontWeight:800,
          background:lang===l?"var(--a)":"transparent",
          color:lang===l?"white":"var(--muted)",
          border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
};

const Landing = ({ onLogin }) => {
  const { t } = useLang();
  const { theme } = useTheme();
  const lt = t.landing;
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{minHeight:"100vh", position:"relative", overflow:"hidden"}}>
      <div className="grid-bg"/>
      <SakuraPetals/>
      <div className="orb" style={{width:600,height:600,background:`radial-gradient(circle,${theme.accentDim.replace("0.07","0.15")} 0%,transparent 70%)`,top:-200,right:-100}}/>
      <nav style={{
        position:"sticky",top:0,zIndex:100,padding:"0 5%",
        height:64,display:"flex",alignItems:"center",justifyContent:"space-between",
        background:`${theme.bg2}cc`,backdropFilter:"blur(16px)",
        borderBottom:"1px solid var(--border)",
      }}>
        <div className="syne" style={{fontSize:20,fontWeight:800,letterSpacing:-0.5}}>
          <span className="accent-text">osu!</span><span style={{color:"var(--text)"}}>Tracker</span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <LangToggle/>
          <button className="btn-accent" style={{padding:"8px 20px",fontSize:13,borderRadius:10}} onClick={onLogin}>{lt.loginBtn}</button>
        </div>
      </nav>
      <section style={{padding:"100px 5% 80px",textAlign:"center",position:"relative",zIndex:1}}>
        <h1 className="hero-title fu d1" style={{fontSize:"clamp(3rem,7vw,6rem)",color:"var(--text)",marginBottom:12}}>
          {lt.hero1}<br/><span className="accent-text">{lt.hero2}</span>
        </h1>
        <button className="btn-accent" style={{padding:"14px 32px",fontSize:15,borderRadius:12}} onClick={onLogin}>{lt.loginBtn}</button>
      </section>
    </div>
  );
};

const LoginModal = ({ onClose }) => {
  const { theme } = useTheme();
  const handleLogin = () => {
    const clientID = '49205';
    const redirectUri = encodeURIComponent('https://osu-stats-five.vercel.app/');
    window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectUri}&scope=identify+public`;
  };
  return (
    <div style={{position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(6px)"}}>
      <div className="card" style={{width:360, padding:28, background:"var(--card2)", textAlign:"center"}}>
        <h2 className="syne">osu! Login</h2>
        <p style={{color:"var(--muted)", margin:"15px 0"}}>Authorize to see your profile stats.</p>
        <button className="btn-accent" style={{width:"100%"}} onClick={handleLogin}>Authorize with osu!</button>
        <button className="btn-ghost" style={{width:"100%", marginTop:10}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const Topbar = ({ title, onMenu, onLogout, username }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      height:58, borderBottom:"1px solid var(--border)", background:`${theme.bg2}e0`, 
      backdropFilter:"blur(12px)", display:"flex", alignItems:"center", padding:"0 24px", 
      position:"sticky", top:0, zIndex:100,
    }}>
      <button onClick={onMenu} className="btn-ghost" id="mobile-menu-btn" style={{display:"none"}}>☰</button>
      <h1 className="syne" style={{fontSize:16, fontWeight:700}}>{title}</h1>
      <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:12}}>
        <div style={{background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", cursor: "pointer"}} onClick={onLogout}>
          <span style={{fontSize: 12, color: "var(--muted)"}}>{username || "Guest"} (Logout ↪)</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('osu_session')));
  const [lang, setLang] = useState("en");
  const [themeKey, setThemeKey] = useState("midnight");
  const [page, setPage] = useState("dashboard");
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('osu_session'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Обработка OAuth редиректа
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !userData) {
      window.history.replaceState({}, document.title, "/");
      
      axios.get(`http://localhost:5000/api/auth/osu?code=${code}`)
        .then(res => {
          const data = res.data.user;
          localStorage.setItem('osu_session', JSON.stringify(data));
          setUserData(data);
          setLoggedIn(true);
          setPage("dashboard");
        })
        .catch(err => {
          console.error("Auth error:", err);
          alert("Ошибка входа. Проверь, запущен ли сервер бэкенда.");
        });
    }
  }, [userData]);

  const theme = THEMES[themeKey] || THEMES.midnight;
  const t = { ...T[lang], lang };
  const titles = { dashboard: t.nav.dashboard, profile: t.nav.profile, stats: t.nav.stats, maps: t.nav.maps, admin: t.nav.admin };

  const handleLogout = () => {
    localStorage.removeItem('osu_session');
    setUserData(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <LangCtx.Provider value={{lang, t, setLang}}>
        <ThemeCtx.Provider value={{theme, themeKey, setTheme: k => setThemeKey(k)}}>
          <GlobalStyle theme={theme}/>
          <Landing onLogin={()=>setShowLogin(true)}/>
          {showLogin && <LoginModal onClose={()=>setShowLogin(false)} />}
        </ThemeCtx.Provider>
      </LangCtx.Provider>
    );
  }

  const pageMap = {
    dashboard: <Dashboard user={userData || MOCK_PLAYER} />,
    profile:   <Profile user={userData || MOCK_PLAYER} />,
    stats:     <Statistics user={userData || MOCK_PLAYER} />,
    maps:      <MapCatalog user={userData || MOCK_PLAYER} />,
    admin:     <AdminPanel/>,
  };

  return (
    <LangCtx.Provider value={{lang, t, setLang}}>
      <ThemeCtx.Provider value={{theme, themeKey, setTheme: k => setThemeKey(k)}}>
        <GlobalStyle theme={theme}/>
        <div style={{display:"flex", minHeight:"100vh", position:"relative"}}>
          <SakuraPetals/>
          <Sidebar page={page} setPage={p=>{ setPage(p); setSidebarOpen(false); }} open={sidebarOpen} />
          {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:150}}/>}
          
          <main style={{flex:1, display:"flex", flexDirection:"column", minWidth:0}}>
            <Topbar title={titles[page]} onMenu={()=>setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} username={userData?.username} />
            <div style={{flex:1, padding:"24px 22px", maxWidth:1180, width:"100%", margin:"0 auto"}}>
              {pageMap[page]}
            </div>
          </main>
        </div>
      </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}

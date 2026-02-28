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


export const LangCtx = createContext({ lang: "en", t: T.en, setLang: () => {} });
export const useLang = () => useContext(LangCtx);

export const ThemeCtx = createContext({ theme: THEMES.midnight, themeKey: "midnight", setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);
import axios from 'axios';

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

/* Floating sakura petals */
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
   LANDING PAGE
══════════════════════════════════════════ */
const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div style={{display:"flex",alignItems:"center",
      background:"var(--card2)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden"}}>
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
      <div className="orb" style={{width:400,height:400,background:`radial-gradient(circle,rgba(255,182,193,0.08) 0%,transparent 70%)`,bottom:100,left:-150}}/>

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
          <button className="btn-accent" style={{padding:"8px 20px",fontSize:13,borderRadius:10}}
            onClick={onLogin}>{lt.loginBtn}</button>
        </div>
      </nav>

      <section style={{padding:"100px 5% 80px",textAlign:"center",position:"relative",zIndex:1}}>
        <div className="fu" style={{
          display:"inline-flex",alignItems:"center",gap:8,
          background:"var(--dim)",border:"1px solid var(--border)",
          borderRadius:50,padding:"6px 18px",fontSize:12,fontWeight:700,
          color:"var(--a3)",marginBottom:28,letterSpacing:0.5,
        }}>
          🌸 osu!Tracker Pro
        </div>
        <h1 className="hero-title fu d1" style={{fontSize:"clamp(3rem,7vw,6rem)",color:"var(--text)",marginBottom:12}}>
          {lt.hero1}<br/>
          <span className="accent-text">{lt.hero2}</span>
        </h1>
        <p className="fu d2" style={{
          fontSize:"clamp(1rem,2vw,1.2rem)",color:"var(--muted)",
          maxWidth:560,margin:"0 auto 40px",lineHeight:1.7,
        }}>{lt.heroSub}</p>
        <div className="fu d3" style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-accent" style={{padding:"14px 32px",fontSize:15,borderRadius:12,fontFamily:"'Syne',sans-serif"}}
            onClick={onLogin}>
            <span style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor"><circle cx="16" cy="16" r="16" opacity="0.3"/><circle cx="16" cy="16" r="7"/></svg>
              {lt.loginBtn}
            </span>
          </button>
          <button className="btn-ghost" style={{padding:"14px 32px",fontSize:15,borderRadius:12}}
            onClick={onLogin}>
            {lt.cta}
          </button>
        </div>

        <div className="fu d4" style={{
          display:"flex",justifyContent:"center",gap:"clamp(24px,4vw,60px)",
          marginTop:60,flexWrap:"wrap",
        }}>
          {[["1.2M+","Players tracked"],["214K+","Maps indexed"],["99.9%","Uptime"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div className="syne" style={{fontSize:28,fontWeight:800,color:"var(--a)"}}>{n}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:2,letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"60px 5%",position:"relative",zIndex:1}}>
        <h2 className="syne fu" style={{textAlign:"center",fontSize:32,fontWeight:800,marginBottom:12}}>
          {lt.featTitle}
        </h2>
        <p className="fu d1" style={{textAlign:"center",color:"var(--muted)",marginBottom:44,fontSize:14}}>
          {t.lang === "ru" ? "Три кита osu!Tracker" : "The three pillars of osu!Tracker"}
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,maxWidth:1000,margin:"0 auto"}}>
          {[
            {icon:"⊙",t:lt.feat1t,d:lt.feat1d,c:"var(--a)"},
            {icon:"◈",t:lt.feat2t,d:lt.feat2d,c:"var(--amber)"},
            {icon:"◉",t:lt.feat3t,d:lt.feat3d,c:"#a78bfa"},
          ].map((f,i)=>(
            <div key={i} className={`feature-card fu d${i+2}`}
              onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
              style={{borderTopColor:hovered===i?f.c:"transparent"}}>
              <div style={{
                width:48,height:48,borderRadius:14,marginBottom:16,
                background:`${f.c}18`,border:`1px solid ${f.c}30`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:22,color:f.c,
              }}>{f.icon}</div>
              <h3 className="syne" style={{fontSize:17,fontWeight:700,marginBottom:8}}>{f.t}</h3>
              <p style={{fontSize:13.5,color:"var(--muted)",lineHeight:1.7}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{
        borderTop:"1px solid var(--border)",padding:"24px 5%",
        display:"flex",alignItems:"center",justifyContent:"center",
        zIndex:1,position:"relative",
      }}>
        <p style={{fontSize:12,color:"var(--muted)",textAlign:"center"}}>{lt.footer}</p>
      </footer>
    </div>
  );
};

/* ══════════════════════════════════════════
   LOGIN MODAL
══════════════════════════════════════════ */
const LoginModal = ({ onClose, onSuccess }) => {
  const { t } = useLang();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);

  const handleLogin = () => {
    const clientID= '49205';
    const redirectUri = encodeURIComponent('https://osu-stats-five.vercel.app/');
    window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectUri}&scope=identify+public`;
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.8)", backdropFilter:"blur(6px)",
    }}>
      <div className="card" style={{
        width:360, padding:28, position:"relative", overflow:"hidden",
        background:"var(--card2)", borderWidth:2,
      }}>
        <div style={{
          position:"absolute", inset:0, opacity:0.1,
          background:`radial-gradient(circle at 70% 20%, ${theme.accent}, transparent 70%)`,
        }}/>
        <h2 className="syne" style={{fontSize:22, fontWeight:800, marginBottom:20, textAlign:"center"}}>
          {step===2 ? "✓ Success!" : "osu! Login"}
        </h2>
        {step===0 && (
          <>
            <p style={{fontSize:13, color:"var(--muted)", marginBottom:24, textAlign:"center"}}>
              Connect your osu! account to unlock analytics.
            </p>
            <button className="btn-accent" style={{width:"100%", padding:"12px", fontSize:14}} onClick={handleLogin}>
              Authorize with osu!
            </button>
          </>
        )}
        {step===1 && (
          <div style={{textAlign:"center", padding:20}}>
            <div style={{
              width:48,height:48, border:"4px solid var(--border)", borderRadius:"50%",
              borderTopColor:theme.accent, margin:"20px auto", animation:"spin 1s linear infinite",
            }}/>
            <p style={{fontSize:13, color:"var(--muted)"}}>Connecting...</p>
          </div>
        )}
        {step===2 && (
          <div style={{textAlign:"center", padding:20}}>
            <div style={{
              width:48,height:48, borderRadius:"50%", background:"#68d89120",
              color:"#68d891", fontSize:28, margin:"20px auto",
            }}>✓</div>
            <p style={{fontSize:13, color:"var(--muted)"}}>Redirecting...</p>
          </div>
        )}
        <button className="btn-ghost" style={{width:"100%", padding:"8px", marginTop:16}}
          onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   TOPBAR — uses theme bg colors
══════════════════════════════════════════ */
const Topbar = ({ title, onMenu, onLogout, username }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      height:58,borderBottom:"1px solid var(--border)",
      background:`${theme.bg2}e0`,backdropFilter:"blur(12px)",
      display:"flex",alignItems:"center",padding:"0 24px",gap:14,
      position:"sticky",top:0,zIndex:100,
    }}>
      <button onClick={onMenu} className="btn-ghost" style={{
        display:"none",padding:"6px 10px",fontSize:16,borderRadius:8,
      }} id="mobile-menu-btn">☰</button>
      <h1 className="syne" style={{fontSize:16,fontWeight:700}}>{title}</h1>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--card2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "5px 12px", cursor: "pointer",
        }} onClick={onLogout} title="Click to Logout">
          <div style={{width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.6)"}}/>
          <span style={{fontSize: 12, color: "var(--muted)", fontWeight: 500}}>
            {username || "sakura_beats"}
          </span>
          <span style={{fontSize: 10, opacity: 0.5, marginLeft: 4}}>Log out ↪</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const savedSession = JSON.parse(localStorage.getItem('osu_session'));

  const [userData, setUserData] = useState(savedSession);
  const [lang, setLang] = useState("en");
  const [themeKey, setThemeKey] = useState("midnight");
  const [page, setPage] = useState(savedSession ? "dashboard" : "landing");
  const [loggedIn, setLoggedIn] = useState(!!savedSession);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authError, setAuthError] = useState(null);

 useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  // Добавляем проверку, чтобы не слать запрос, если юзер уже загружен
  if (code && !user) {
    console.log("Пытаюсь авторизоваться с кодом:", code);
    
    // Сразу чистим URL, чтобы повторный рендер не подхватил код
    window.history.replaceState({}, document.title, "/");

    axios.get(`http://localhost:5000/api/auth/osu?code=${code}`)
      .then(res => {
        console.log("Успешный вход!", res.data);
        setUser(res.data.user);
      })
      .catch(err => {
        console.error("Детальная ошибка бэкенда:", err.response?.data || err.message);
        alert("Ошибка авторизации. Проверь консоль сервера.");
      });
  }
}, [user]); // Добавляем зависимость

  const theme = THEMES[themeKey] || THEMES.midnight;
  const t = { ...T[lang], lang };

  const titles = {
    dashboard: t.nav.dashboard, profile: t.nav.profile,
    stats: t.nav.stats, maps: t.nav.maps, admin: t.nav.admin,
  };

  const handleLogin = () => { setLoggedIn(true); setPage("dashboard"); };
  const handleLogout = () => {
    localStorage.removeItem('osu_session');
    setUserData(null);
    setLoggedIn(false);
    setPage("landing");
  };

  if (!loggedIn) {
    return (
      <LangCtx.Provider value={{lang, t, setLang}}>
        <ThemeCtx.Provider value={{theme, themeKey, setTheme: k => setThemeKey(k)}}>
          <GlobalStyle theme={theme}/>
          <div className="grid-bg"/>
          <Landing onLogin={()=>setShowLogin(true)}/>
          {showLogin && (
            <LoginModal
              onClose={()=>setShowLogin(false)}
              onSuccess={handleLogin}
            />
          )}
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
        <div className="grid-bg"/>
        <div className="orb" style={{width:500,height:500,background:`radial-gradient(circle,${theme.accentDim.replace("0.07","0.08")} 0%,transparent 70%)`,top:-100,right:-100}}/>
        <div className="orb" style={{width:300,height:300,background:`radial-gradient(circle,${theme.amberDim} 0%,transparent 70%)`,bottom:50,left:-100}}/>
        {showLogin && (
          <LoginModal onClose={()=>setShowLogin(false)} onSuccess={handleLogin}/>
        )}

        <div style={{display:"flex",minHeight:"100vh",position:"relative",zIndex:1}}>
          <SakuraPetals/>
          <Sidebar
            page={page}
            setPage={p=>{ setPage(p); setSidebarOpen(false); }}
            open={sidebarOpen}
          />

          {sidebarOpen && (
            <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:150}}/>
          )}

          <main className="mcol" style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
            <Topbar
              title={titles[page]}
              onMenu={()=>setSidebarOpen(!sidebarOpen)}
              onLogout={handleLogout}
              username={userData?.username}
            />
            <div style={{flex:1,padding:"24px 22px",maxWidth:1180,width:"100%",margin:"0 auto"}} key={page}>
              {pageMap[page]}
            </div>
          </main>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .sidebar { position: fixed !important; }
            #mobile-menu-btn { display: flex !important; }
          }
        `}</style>
      </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}

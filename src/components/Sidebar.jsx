import React from 'react';
import { useLang, useTheme, fmt } from '../App'; 
import { MOCK_PLAYER } from '../constants/mockData'; 

const NAV_ITEMS = (t) => [
  {id:"dashboard", icon:"⊞", label:t.nav.dashboard},
  {id:"profile",   icon:"◉", label:t.nav.profile},
  {id:"stats",     icon:"◈", label:t.nav.stats},
  {id:"maps",      icon:"♪", label:t.nav.maps},
  {id:"admin",     icon:"⚙", label:t.nav.admin},
];

const Sidebar = ({ page, setPage, open }) => {
  const { t } = useLang();
  const { theme } = useTheme();
  const navItems = NAV_ITEMS(t);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} style={{
      width: 220, minHeight: "100vh", background: "var(--bg2)",
      borderRight: "1px solid var(--border)", padding: "20px 10px",
      display: "flex", flexDirection: "column", gap: 4,
      position: "sticky", top: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{padding:"4px 12px 20px", borderBottom:"1px solid var(--border)", marginBottom:4}}>
        <div className="syne" style={{fontSize:19, fontWeight:800, letterSpacing:-0.5}}>
          <span className="accent-text">osu!</span><span>Tracker</span>
        </div>
        <div style={{fontSize:10, color:"var(--muted)", letterSpacing:2, marginTop:1}}>🌸 ANALYTICS PRO</div>
      </div>

      {navItems.map(n => (
        <div 
          key={n.id} 
          className={`nav-item ${page === n.id ? "active" : ""}`} 
          onClick={() => setPage(n.id)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' }}
        >
          <span style={{fontSize:15, width:18, textAlign:"center"}}>{n.icon}</span>
          <span>{n.label}</span>
          {page === n.id && <span style={{marginLeft:"auto", width:5, height:5, borderRadius:"50%", background:"var(--a)", boxShadow:"0 0 6px var(--a)"}}/>}
        </div>
      ))}

      {/* User mini */}
      <div style={{marginTop:"auto", paddingTop:16, borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex", alignItems: "center", gap:10, padding:"8px 10px"}}>
          <div style={{
            width:32, height:32, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, color:theme.bg, fontWeight:700,
            boxShadow:`0 0 14px ${theme.accentGlow}`,
          }}>S</div>
          <div>
            <div style={{fontSize:13, fontWeight:600}}>{MOCK_PLAYER.username}</div>
            <div style={{fontSize:11, color:"var(--muted)"}}>
              #{fmt(MOCK_PLAYER.rank)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
//бля
export default Sidebar;
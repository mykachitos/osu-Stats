import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ХЭПЛЕРОСИКИ
import { useLang, fmt, Stars } from '../App';
// ЛОГИКА+ ДАННЫЕ 
import { RECOMMENDED_MAPS } from '../constants/mockData';
import { computeSkills, computePPTrend, recommendMaps } from '../utils/helpers';

const Dashboard = ({ user }) => {
  const [addedQ, setAddedQ] = useState({});
  const [filter, setFilter] = useState(0);
  const { t, lang } = useLang();
  const dt = t.dash;

  // 1. СТРОГАЯ ПРОВЕРКА (сначала хуки, потом это)
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Please login to see your stats</h2>
        <p>Your session was cleared.</p>
      </div>
    );
  }

  const p = user;
  const stats = p.statistics || {};

  // 2. БЕЗОПАСНЫЕ РАСЧЕТЫ (защита от белого экрана)
  const skills = (p && (p.statistics || p.params)) ? computeSkills(p) : [];
  const ppTrend = (p && (p.statistics || p.params)) ? computePPTrend(p) : [];
  const recommended = (p && (p.statistics || p.params)) ? recommendMaps(p, RECOMMENDED_MAPS) : [];
  
  const filterLabels = dt.filters;

  // 3. БЕЗОПАСНЫЙ ТИР 
  const getTier = (pp) => {
    const topPP = p.topPlay?.pp || p.pp || 0;
    const d = pp - topPP;
    
    if (d > 50) return { i: 3, label: dt.filters[3], c: "#f87171", bg: "rgba(248,113,113,0.12)" };
    if (d > 0) return { i: 2, label: dt.filters[2], c: "var(--amber)", bg: "var(--amberDim)" };
    if (d > -80) return { i: 1, label: dt.filters[1], c: "#68d891", bg: "rgba(104,216,145,0.12)" };
    return { i: 0, label: dt.filters[0], c: "#7eb8f7", bg: "rgba(126,184,247,0.12)" };
  };

  const filtered = filter === 0 ? recommended : recommended.filter(m => getTier(m.pp).i === filter);

  // вспомогательная буква для аватара которая будет высвечиваться если авы нет (никит если ты это читаешь соси)
  const initial = (p.username || "U").charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Hero card */}
      <div className="card fu" style={{
        padding: "28px 32px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg,var(--card) 0%,var(--card2) 100%)",
      }}>
        <div style={{
          position: "absolute", right: -60, top: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle,var(--glow) 0%,transparent 65%)"
        }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", position: "relative" }}>
          
          {/* АВАТАРКА С ПРОВЕРКОЙ */}
          <div style={{
            width: 80, height: 80, borderRadius: 22, flexShrink: 0,
            background: p.avatar_url ? `url(${p.avatar_url}) center/cover` : "var(--grad)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: "var(--bg)", fontWeight: 800,
            boxShadow: "0 8px 30px var(--glow)",
            border: "2px solid var(--border)",
            overflow: "hidden"
          }}>
            {!p.avatar_url && initial}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 className="syne" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
                {dt.welcome} <span className="accent-text">{p.username}</span>
              </h2>
              {/* ФЛАЖОК СТРАНЫ */}
              <span style={{ 
                fontSize: 22, 
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                cursor: "help" 
              }} title={p.country_code}>
                {p.country_code === 'RU' ? '🇷🇺' : p.country_code === 'JP' ? '🇯🇵' : (p.country_code || '🏳️')}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.badges?.map(b => <span key={b} className="tag">{b}</span>) || <span className="tag">Player</span>}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 38, fontWeight: 700, color: "var(--a)", lineHeight: 1 }}>
                {fmt(Math.round(stats.pp || 0))}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Performance Points</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginTop: 24 }}>
  {[
    { 
        l: lang === "ru" ? "Глоб. рейтинг" : "Global Rank", 
        v: `#${fmt(stats.global_rank || 0)}`, 
        icon: "🌍", c: "var(--a)" 
    },
    { 
        l: lang === "ru" ? "Рейтинг страны" : "Country Rank", 
        v: `#${fmt(stats.country_rank || 0)}`, 
        icon: "🏆", c: "var(--amber)" 
    },
    { 
        l: lang === "ru" ? "Точность" : "Accuracy", 
        v: `${(stats.hit_accuracy || 0).toFixed(2)}%`, 
        icon: "◎", c: "#68d891" 
    },
    { 
        l: lang === "ru" ? "Игр" : "Play Count", 
        v: fmt(stats.play_count || 0), 
        icon: "▶", c: "#7eb8f7" 
    },
    { 
        l: lang === "ru" ? "Время" : "Play Time", 
        v: `${Math.floor((stats.play_time || 0) / 3600)}h`, 
        icon: "⏱", c: "#c084fc" 
    },
    { 
        l: lang === "ru" ? "Макс. комбо" : "Max Combo", 
        v: `${fmt(stats.maximum_combo || 0)}x`, 
        icon: "🔥", c: "#f87171" 
    },
  ].map((s, i) => (
    <div key={i} style={{
      background: "var(--bg2)", borderRadius: 12, padding: "12px 14px",
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
      <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, letterSpacing: 0.3 }}>{s.l}</div>
    </div>
  ))}
</div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card fu d2" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span className="accent-text">◈</span> {dt.ppProgress}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={ppTrend}>
              <defs>
                <linearGradient id="ppG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--a)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--a)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
              <Area type="monotone" dataKey="pp" stroke="var(--a)" strokeWidth={2} fill="url(#ppG)" dot={{ fill: "var(--a2)", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card fu d3" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span className="accent-text">◉</span> {dt.skillRadar}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={skills}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey={lang === "ru" ? "skillRu" : "skill"} tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="var(--a)" fill="var(--dim)" strokeWidth={2} />
              <Tooltip contentStyle={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grades + Recent */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18 }}>
        <div className="card fu d3" style={{ padding: 22, minWidth: 190 }}>
          <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 14 }}>
            <span className="accent-text">★</span> {dt.grades}
          </div>
          {p.grades ? Object.entries(p.grades).map(([g, cnt]) => (
            <div key={g} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className={`rank-badge rank-${g}`}>{g}</span>
              <div className="pb-wrap" style={{ flex: 1 }}>
                <div className="pb" style={{ width: `${Math.min(100, cnt / 7)}%` }} />
              </div>
              <span className="mono" style={{ fontSize: 12, minWidth: 28, textAlign: "right" }}>{cnt}</span>
            </div>
          )) : <div style={{fontSize: 12, color: 'var(--muted)'}}>No grades found</div>}
        </div>
        <div className="card fu d4" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>
            <span className="accent-text">▶</span> {dt.recentPlays}
          </div>
          {p.recentActivity?.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
              borderBottom: i < p.recentActivity.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.map}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.diff} · {r.acc}%</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {r.pp > 0 && <div className="mono" style={{ fontWeight: 700, color: "var(--a)", fontSize: 13 }}>{r.pp}pp</div>}
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.date}</div>
              </div>
            </div>
          )) || <div style={{fontSize: 12, color: 'var(--muted)'}}>No recent activity</div>}
        </div>
      </div>

      {/* Map Recommendations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, background: "var(--grad)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "var(--bg)", boxShadow: "0 4px 14px var(--glow)",
            }}>♪</div>
            <div>
              <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>{dt.mapsForYou}</h3>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>{dt.basedOn} <span style={{ color: "var(--a)", fontWeight: 700 }}>{p.topPlay?.pp || p.pp || 0}pp</span></p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {filterLabels.map((f, i) => (
              <button key={f} onClick={() => setFilter(i)} style={{
                padding: "4px 12px", borderRadius: 20, border: "1px solid",
                borderColor: filter === i ? "var(--a)" : "var(--border)",
                background: filter === i ? "var(--a)" : "var(--card2)",
                color: filter === i ? "var(--bg)" : "var(--muted)",
                cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {filtered.map((m, i) => {
            const tier = getTier(m.pp);
            const isAdded = !!addedQ[m.id];
            const d = m.ppDiff >= 0 ? `+${m.ppDiff.toFixed(0)}` : m.ppDiff.toFixed(0);
            return (
              <div key={m.id} className="card map-card fu" style={{
                animationDelay: `${i * 0.04}s`, overflow: "hidden", display: "flex", flexDirection: "column",
                cursor: "pointer",
              }} onClick={() => window.open(`https://osu.ppy.sh/beatmapsets/${m.beatmapSetId}`, "_blank")}>
                <div style={{
                  height: 68, background: `linear-gradient(135deg,${tier.bg},var(--bg2))`,
                  borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden",
                  display: "flex", alignItems: "center", padding: "0 14px",
                }}>
                  <span style={{ fontSize: 24, marginRight: 10, opacity: 0.8 }}>♪</span>
                  <div>
                    <div style={{ fontSize: 10, color: tier.c, fontWeight: 700 }}>{tier.label}</div>
                    <div className="mono" style={{ fontSize: 11, color: tier.c }}>{d}pp vs best</div>
                  </div>
                  {m.matchesWeak && <span style={{
                    position: "absolute", top: 6, right: 8, fontSize: 9,
                    background: "var(--amber)20", color: "var(--amber)", border: "1px solid var(--amber)30",
                    borderRadius: 10, padding: "2px 5px", fontWeight: 700
                  }}>
                    {lang === "ru" ? "слабость" : "weakness"} ↑
                  </span>}
                  <span style={{ position: "absolute", bottom: 6, right: 8, fontSize: 9, color: "var(--muted)", opacity: 0.7 }}>osu! ↗</span>
                </div>
                <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.artist}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--a)" }}>{m.pp}<span style={{ fontSize: 10, color: "var(--muted)" }}>pp</span></span>
                    <Stars v={m.stars} />
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[`AR ${m.ar}`, `BPM ${m.bpm}`, m.length].map(tag => (
                      <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setAddedQ(prev => ({ ...prev, [m.id]: !prev[m.id] }));
                  }}
                    style={{
                      marginTop: "auto", width: "100%", padding: "6px", borderRadius: 8, border: "1px solid",
                      borderColor: isAdded ? "rgba(104,216,145,0.4)" : "var(--border)",
                      background: isAdded ? "rgba(104,216,145,0.12)" : "var(--grad)",
                      color: isAdded ? "#68d891" : "var(--bg)",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                    }}>{isAdded ? dt.added : dt.addQueue}</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--a)", cursor: "pointer", fontWeight: 600 }}>{dt.viewAll}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
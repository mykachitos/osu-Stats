import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

import { useLang, fmt, Stars } from '../App';
import { MOCK_PLAYER } from '../constants/mockData';
import { computeSkills, computePPTrend } from '../utils/helpers';

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
const Dashboard = ({ user }) => {
  const [recentExpanded, setRecentExpanded] = useState(false);
  const { t, lang } = useLang();
  const dt = t.dash;

  if (!user) {
    return (
      <div style={{ padding:40, textAlign:'center' }}>
        <h2>Please login to see your stats</h2>
        <p>Your session was cleared.</p>
      </div>
    );
  }

  // Нормализуем данные — реальный юзер из API возвращает поля напрямую (pp, accuracy...),
  // а моковый игрок использует camelCase (globalRank, playCount...).
  // Хелперы computeSkills/computePPTrend смотрят на recentActivity и ppHistory —
  // если их нет (реальный юзер без расширенных данных), подставляем мок для графиков.
  const p = user;

  // Для скилл радара и PP прогресса нужны recentActivity и ppHistory.
  // Если их нет у реального юзера — показываем моковые данные как placeholder.
  const playerForCharts = (p.recentActivity?.length || p.ppHistory?.length)
    ? p
    : { ...MOCK_PLAYER, pp: p.pp || MOCK_PLAYER.pp, username: p.username };

  let skills = [];
  let ppTrend = [];
  try { skills  = computeSkills(playerForCharts); }  catch(e) { skills = []; }
  try { ppTrend = computePPTrend(playerForCharts); } catch(e) { ppTrend = []; }

  const initial = (p.username || "U").charAt(0).toUpperCase();

  // grades — only non-zero entries
  const gradesEntries = p.grades
    ? Object.entries(p.grades).filter(([,cnt]) => cnt > 0)
    : [];
  const maxGradeCount = gradesEntries.length
    ? Math.max(...gradesEntries.map(([,c]) => c))
    : 1;

  const recentAll = p.recentActivity || [];
  const recentVisible = recentExpanded ? recentAll : recentAll.slice(0, 3);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      {/* ── Hero card ── */}
      <div className="card fu" style={{
        padding:'28px 32px', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,var(--card) 0%,var(--card2) 100%)',
      }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300,
          borderRadius:'50%', background:'radial-gradient(circle,var(--glow) 0%,transparent 65%)' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:22, flexWrap:'wrap', position:'relative' }}>
          <div style={{
            width:80, height:80, borderRadius:22, flexShrink:0,
            background: p.avatar_url ? `url(${p.avatar_url}) center/cover` : 'var(--grad)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, color:'var(--bg)', fontWeight:800,
            boxShadow:'0 8px 30px var(--glow)', border:'2px solid var(--border)', overflow:'hidden',
          }}>
            {!p.avatar_url && initial}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:6 }}>
              <h2 className="syne" style={{ fontSize:26, fontWeight:800, lineHeight:1.2 }}>
                {dt.welcome} <span className="accent-text">{p.username}</span>
              </h2>
              <span style={{ fontSize:22, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', cursor:'help' }} title={p.country_code}>
                {p.country_code==='RU'?'🇷🇺':p.country_code==='JP'?'🇯🇵':(p.country_code||'🏳️')}
              </span>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {p.badges?.map(b=><span key={b} className="tag">{b}</span>)||<span className="tag">Player</span>}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div className="mono" style={{ fontSize:38, fontWeight:700, color:'var(--a)', lineHeight:1 }}>
              {fmt(Math.round(p.pp||0))}
            </div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Performance Points</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12, marginTop:24 }}>
          {[
            { l:lang==='ru'?'Глоб. рейтинг':'Global Rank',  v:`#${fmt(p.global_rank||p.globalRank||0)}`, icon:'🌍', c:'var(--a)' },
            { l:lang==='ru'?'Рейтинг страны':'Country Rank', v:`#${fmt(p.country_rank||p.countryRank||0)}`, icon:'🏆', c:'var(--amber)' },
            { l:lang==='ru'?'Точность':'Accuracy',            v:`${p.accuracy||0}%`, icon:'◎', c:'#68d891' },
            { l:lang==='ru'?'Игр':'Play Count',               v:fmt(p.play_count||p.playCount||0), icon:'▶', c:'#7eb8f7' },
            { l:lang==='ru'?'Время':'Play Time',              v:p.play_time||p.playTime||'0h', icon:'⏱', c:'#c084fc' },
            { l:lang==='ru'?'Макс. комбо':'Max Combo',        v:`${fmt(p.max_combo||p.maxCombo||0)}x`, icon:'🔥', c:'#f87171' },
          ].map((s,i) => (
            <div key={i} style={{ background:'var(--bg2)', borderRadius:12, padding:'12px 14px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
              <div className="mono" style={{ fontSize:16, fontWeight:700, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, letterSpacing:0.3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card fu d2" style={{ padding:22 }}>
          <div style={{ fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
            <span className="accent-text">◈</span> {dt.ppProgress}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={ppTrend}>
              <defs>
                <linearGradient id="ppG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--a)" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="var(--a)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill:'var(--muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis domain={['auto','auto']} tick={{ fill:'var(--muted)', fontSize:11 }} axisLine={false} tickLine={false} width={42}/>
              <Tooltip contentStyle={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)' }}/>
              <Area type="monotone" dataKey="pp" stroke="var(--a)" strokeWidth={2} fill="url(#ppG)" dot={{ fill:'var(--a2)', r:3 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card fu d3" style={{ padding:22 }}>
          <div style={{ fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
            <span className="accent-text">◉</span> {dt.skillRadar}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={skills}>
              <PolarGrid stroke="var(--border)"/>
              <PolarAngleAxis dataKey={lang==='ru'?'skillRu':'skill'} tick={{ fill:'var(--muted)', fontSize:11 }}/>
              <Radar dataKey="value" stroke="var(--a)" fill="var(--dim)" strokeWidth={2}/>
              <Tooltip contentStyle={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)' }}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Grades + Recent Plays ── */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:18 }}>

        {/* GRADES — compact, only non-zero */}
        <div className="card fu d3" style={{ padding:'18px 22px', minWidth:160, alignSelf:'start' }}>
          <div style={{ fontWeight:700, marginBottom:14, fontSize:14 }}>
            <span className="accent-text">★</span> {dt.grades}
          </div>
          {gradesEntries.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {gradesEntries.map(([g, cnt]) => (
                <div key={g} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className={`rank-badge rank-${g}`} style={{ minWidth:36, textAlign:'center' }}>{g}</span>
                  <div className="pb-wrap" style={{ flex:1 }}>
                    <div className="pb" style={{ width:`${Math.min(100,(cnt/maxGradeCount)*100)}%` }}/>
                  </div>
                  <span className="mono" style={{ fontSize:12, minWidth:28, textAlign:'right' }}>{cnt}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize:12, color:'var(--muted)' }}>No grades</div>}
        </div>

        {/* RECENT PLAYS — collapsible */}
        <div className="card fu d4" style={{ padding:22, alignSelf:'start' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>
              <span className="accent-text">▶</span> {dt.recentPlays}
            </div>
            {recentAll.length > 3 && (
              <button
                onClick={() => setRecentExpanded(v => !v)}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  background:'var(--dim)', border:'1px solid var(--border)',
                  borderRadius:20, padding:'4px 12px', cursor:'pointer',
                  fontSize:11, fontWeight:700, color:'var(--a3)',
                  fontFamily:'inherit', transition:'all 0.2s',
                }}>
                <span style={{ transition:'transform 0.25s', display:'inline-block', transform: recentExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                {recentExpanded
                  ? (lang==='ru' ? 'Свернуть' : 'Collapse')
                  : (lang==='ru' ? `Ещё ${recentAll.length-3}` : `+${recentAll.length-3} more`)
                }
              </button>
            )}
          </div>

          {recentVisible.length > 0 ? recentVisible.map((r, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12, padding:'9px 0',
              borderBottom: i < recentVisible.length-1 ? '1px solid var(--border)' : 'none',
              animation: i >= 3 && !recentExpanded ? 'none' : 'fadeUp 0.3s ease both',
              animationDelay: `${(i-3)*0.05}s`,
            }}>
              <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.map}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{r.diff} · {r.acc}%</div>
              </div>
              <div style={{ textAlign:'right' }}>
                {r.pp > 0 && <div className="mono" style={{ fontWeight:700, color:'var(--a)', fontSize:13 }}>{r.pp}pp</div>}
                <div style={{ fontSize:11, color:'var(--muted)' }}>{r.date}</div>
              </div>
            </div>
          )) : <div style={{ fontSize:12, color:'var(--muted)' }}>No recent activity</div>}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
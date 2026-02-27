import React, { useState, useEffect } from 'react';
import { useLang, useTheme, fmt, Stars } from '../App';
import { computeSkills } from '../utils/helpers'; 

const Profile = ({ user }) => {
  const { t, lang } = useLang();
  const [editing, setEditing] = useState(false);
  
  // 1. Безопасная инициализация формы
  const [form, setForm] = useState({ 
    username: user?.username || "", 
    country: user?.country_code || "" 
  });

  // 2. Синхронизация при загрузке данных
  useEffect(() => {
    if (user) {
      setForm({ username: user.username, country: user.country_code });
    }
  }, [user]);

  // 3. Защита от отсутствия данных (Loader)
  if (!user) {
    return (
      <div className="card" style={{ padding: 60, textAlign: 'center' }}>
        <div className="loader" style={{ margin: "0 auto 20px" }}></div>
        <h2 className="syne" style={{ color: 'var(--muted)' }}>Fetching profile data...</h2>
      </div>
    );
  }

  // 4. Безопасные расчеты (Try/Catch спасает от белого экрана)
  let skills = [];
  try {
    skills = computeSkills(user) || [];
  } catch (e) {
    console.error("Skills failed", e);
  }

  const p = user;
  const initial = (p.username || "S").charAt(0).toUpperCase();
  const topPlay = p.topPlay || p.top_play || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Card */}
      <div className="card fu" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--dim) 0%,transparent 60%)", pointerEvents: "none" }} />
        
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 90, height: 90, borderRadius: 24,
              background: p.avatar_url ? `url(${p.avatar_url}) center/cover` : "var(--grad)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, color: "var(--bg)", fontWeight: 700,
              boxShadow: `0 0 40px var(--glow)`,
              border: "2px solid var(--border)",
              overflow: "hidden"
            }}>
              {!p.avatar_url && initial}
            </div>
            
            <button className="btn-accent" style={{ padding: "6px 16px", fontSize: 12, borderRadius: 8 }} onClick={() => setEditing(!editing)}>
              {editing ? (lang === 'ru' ? 'Отмена' : 'Cancel') : (lang === 'ru' ? 'Изм.' : 'Edit')}
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input-main" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ padding: "8px 12px", width: 280 }} />
                <button className="btn-accent" style={{ padding: "8px 20px", fontSize: 13, width: "fit-content", borderRadius: 8 }} onClick={() => setEditing(false)}>
                  {lang === 'ru' ? 'Сохранить' : 'Save'}
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <h2 className="syne" style={{ fontSize: 28, fontWeight: 800 }}>{p.username}</h2>
                  <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}>
                    {p.country_code === 'RU' ? '🇷🇺' : '🇯🇵'}
                  </span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
                   {lang === 'ru' ? 'В игре с' : 'Member since'} {p.joined || '2022'}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(p.badges || ['Player']).map(b => <span key={b} className="tag">{b}</span>)}
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { l: "Global", v: `#${fmt(p.global_rank || p.globalRank || 0)}`, c: "var(--a)" },
              { l: "Country", v: `#${fmt(p.country_rank || p.countryRank || 0)}`, c: "var(--amber)" },
            ].map(r => (
              <div key={r.l} style={{ background: "var(--bg2)", borderRadius: 12, padding: "14px 18px", border: "1px solid var(--border)", textAlign: "center", minWidth: 100 }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: r.c, marginTop: 4 }}>{r.v}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.5, marginTop: 4 }}>{r.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card fu d1" style={{ padding: 22 }}>
          <h3 className="syne" style={{ fontWeight: 700, marginBottom: 18, color: "var(--a3)", fontSize: 14 }}>
            {lang === 'ru' ? 'СТАТИСТИКА' : 'STATISTICS'}
          </h3>
          {[
            [lang === "ru" ? "Производительность" : "Performance", `${fmt(Math.round(p.pp || 0))} pp`],
            [lang === "ru" ? "Точность" : "Accuracy", `${p.accuracy || 0}%`],
            [lang === "ru" ? "Всего игр" : "Total Play Count", fmt(p.play_count || p.playCount || 0)],
            [lang === "ru" ? "Время игры" : "Play Time", p.play_time || p.playTime || '0h'],
            [lang === "ru" ? "Макс. комбо" : "Max Combo", `${fmt(p.max_combo || p.maxCombo || 0)}x`],
            [lang === "ru" ? "Уровень" : "Level", `${p.level || 0} (${p.level_progress || p.levelProgress || 0}%)`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{k}</span>
              <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {topPlay && (
            <div className="card fu d2" style={{ padding: 22 }}>
              <h3 className="syne" style={{ fontWeight: 700, marginBottom: 14, color: "var(--a3)", fontSize: 14 }}>
                {lang === 'ru' ? 'ЛУЧШАЯ ИГРА' : 'TOP PLAY'}
              </h3>
              <div style={{ background: "var(--bg2)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{topPlay.map}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}><Stars v={topPlay.stars} /></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--a)" }}>{topPlay.pp}pp</div>
                    <span className="rank-badge rank-SS">SS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card fu d4" style={{ padding: 22 }}>
            <h3 className="syne" style={{ fontWeight: 700, marginBottom: 14, color: "var(--a3)", fontSize: 14 }}>
              {lang === "ru" ? "НАВЫКИ" : "SKILLS"}
            </h3>
            {skills.length > 0 ? skills.map(s => (
              <div key={s.skill} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 72, fontSize: 12, color: "var(--muted)" }}>{lang === "ru" ? s.skillRu : s.skill}</div>
                <div className="pb-wrap" style={{ flex: 1 }}>
                  <div className="pb" style={{ width: `${s.value}%` }} />
                </div>
                <span className="mono" style={{ width: 28, textAlign: "right", fontSize: 12, fontWeight: 600 }}>{s.value}</span>
              </div>
            )) : <div style={{ fontSize: 12, color: "var(--muted)" }}>No data available</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLang, fmt, Stars, Notif } from '../App';
import { ADMIN_USERS } from '../constants/mockData';

// ── helpers ───────────────────────────────────────────────────────────────
const fmtSec = s => {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2,'0')}`;
};

// Стили для _label из get-recommendations.js
const LABEL_META = {
  similar:   { en:'Similar',    ru:'Похожие',       c:'#7eb8f7',    bg:'rgba(126,184,247,0.14)' },
  warmup:    { en:'Warm-up',    ru:'Разминка',      c:'#68d891',    bg:'rgba(104,216,145,0.14)' },
  farm:      { en:'Farm',       ru:'Фарм',          c:'#68d891',    bg:'rgba(104,216,145,0.14)' },
  challenge: { en:'Challenge',  ru:'Испытание',     c:'#fbbf24',    bg:'rgba(251,191,36,0.14)'  },
  reading:   { en:'Reading',    ru:'Чтение',        c:'#c084fc',    bg:'rgba(192,132,252,0.14)' },
  speed:     { en:'Speed',      ru:'Скорость',      c:'#fb923c',    bg:'rgba(251,146,60,0.14)'  },
  aim:       { en:'Aim',        ru:'Прицел',        c:'#f87171',    bg:'rgba(248,113,113,0.14)' },
  stamina:   { en:'Stamina',    ru:'Выносливость',  c:'#f472b6',    bg:'rgba(244,114,182,0.14)' },
};
const fallbackLabel = { en:'Pick', ru:'Выбор', c:'var(--a3)', bg:'var(--dim)' };
const getLabel = l => LABEL_META[l?.toLowerCase()] || fallbackLabel;

const MOD_BG   = { DT:'rgba(251,191,36,0.18)',  HD:'rgba(126,184,247,0.18)', HR:'rgba(248,113,113,0.18)', FL:'rgba(186,140,255,0.18)' };
const MOD_TEXT = { DT:'#fbbf24', HD:'#7eb8f7',  HR:'#f87171',               FL:'#ba8cff' };

// ── RangeInput ────────────────────────────────────────────────────────────
const RangeInput = ({ label, minVal, maxVal, onMin, onMax, placeholder=['min','max'], step=1 }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
    <span style={{ fontSize:10, color:'var(--muted)', fontWeight:700, letterSpacing:0.8, textTransform:'uppercase' }}>{label}</span>
    <div style={{ display:'flex', gap:5 }}>
      <input type="number" value={minVal} onChange={e=>onMin(e.target.value)} placeholder={placeholder[0]} step={step}
        style={{ width:64, padding:'5px 8px', fontSize:12, borderRadius:10 }}/>
      <input type="number" value={maxVal} onChange={e=>onMax(e.target.value)} placeholder={placeholder[1]} step={step}
        style={{ width:64, padding:'5px 8px', fontSize:12, borderRadius:10 }}/>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// FOR YOU CARD
// Данные: { id, title, artist, mapper, stars, bpm, ar, od, length(строка),
//           cover, _score, _label, _reason, _starsAboveProfile, play_count }
// PP у этих карт НЕТ — показываем звёзды + _starsAboveProfile + popularity
// ══════════════════════════════════════════════════════════════════════════
const ForYouCard = ({ m, onQueue, queued, lang, idx }) => {
  const lm    = getLabel(m._label);
  const above = m._starsAboveProfile ?? 0;
  const sign  = above >= 0 ? `+${above.toFixed(2)}` : above.toFixed(2);
  const cover = m.cover || null;

  return (
    <div className={`card map-card fu d${idx % 5}`}
      style={{ overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column' }}
      onClick={() => window.open(`https://osu.ppy.sh/beatmapsets/${m.beatmapSetId || m.id}`, '_blank')}>

      {/* Cover */}
      <div style={{
        height:90, position:'relative', overflow:'hidden', flexShrink:0,
        background: cover
          ? `url(${cover}) center/cover no-repeat`
          : `linear-gradient(135deg,${lm.bg},var(--bg2))`,
      }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 25%,rgba(0,0,0,0.82) 100%)' }}/>

        {/* Label top-left */}
        <span style={{
          position:'absolute', top:8, left:8,
          background:lm.bg, color:lm.c, backdropFilter:'blur(6px)',
          borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:800,
          border:`1px solid ${lm.c}35`,
        }}>
          {lang==='ru' ? lm.ru : lm.en}
        </span>

        {/* Stars diff top-right */}
        <span className="mono" style={{
          position:'absolute', top:8, right:8,
          background:'rgba(0,0,0,0.65)', color:lm.c,
          borderRadius:10, padding:'2px 8px', fontSize:10, fontWeight:800,
        }}>
          {sign}★
        </span>

        {/* Stars rating bottom-left */}
        <div style={{ position:'absolute', bottom:7, left:10 }}>
          <Stars v={m.stars || 0}/>
        </div>

        {/* Score dot bottom-right */}
        <span style={{
          position:'absolute', bottom:8, right:8,
          fontSize:9, color:'rgba(255,255,255,0.38)',
        }}>
          ★{(m.stars||0).toFixed(2)}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding:'11px 13px', flex:1, display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ fontWeight:800, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {m.title}
        </div>
        <div style={{ fontSize:10, color:'var(--muted)' }}>{m.artist}</div>
        <div style={{ fontSize:10, color:'var(--a3)', opacity:0.8 }}>by {m.mapper}</div>

        {/* Plays count (нет pp — показываем популярность) */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:2 }}>
          <span style={{ fontSize:11, color:'var(--muted)' }}>
            ▶ {fmt(m.play_count || 0)}
          </span>
          {/* reason badge */}
          {m._reason && (
            <span style={{
              fontSize:9, color:'var(--muted)', background:'var(--bg2)',
              border:'1px solid var(--border)', borderRadius:8, padding:'1px 6px',
            }}>
              {m._reason.replace(/_/g,' ')}
            </span>
          )}
        </div>

        {/* Tags */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {[m.bpm && `BPM ${m.bpm}`, m.ar && `AR ${m.ar}`, m.od && `OD ${m.od}`, m.length]
            .filter(Boolean).map(tag => (
            <span key={tag} className="tag" style={{ fontSize:10 }}>{tag}</span>
          ))}
        </div>

        {/* Queue button */}
        <button onClick={e=>{ e.stopPropagation(); onQueue(m); }}
          style={{
            marginTop:'auto', width:'100%', padding:'6px', borderRadius:10, border:'1px solid',
            borderColor: queued ? 'rgba(104,216,145,0.4)' : 'var(--border)',
            background:  queued ? 'rgba(104,216,145,0.12)' : 'var(--grad)',
            color:       queued ? '#68d891' : 'white',
            cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:800, transition:'all 0.2s',
          }}>
          {queued ? (lang==='ru'?'✓ Добавлено':'✓ Added') : (lang==='ru'?'+ Очередь':'+ Queue')}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BROWSE CARD
// Данные: beatmapset из osu! API — нет pp, есть play_count, difficulty_rating
// ══════════════════════════════════════════════════════════════════════════
const BrowseCard = ({ m, onQueue, queued, lang, viewMode }) => {
  const bm     = m.beatmaps?.[0] || {};
  const stars  = +(bm.difficulty_rating ?? 0).toFixed(2);
  const bpm    = m.bpm ?? 0;
  const ar     = bm.ar ?? 0;
  const od     = bm.accuracy ?? 0;
  const length = bm.hit_length ? fmtSec(bm.hit_length) : '—';
  const plays  = m.play_count ?? 0;
  const cover  = m.covers?.cover || m.covers?.['list@2x'] || null;

  if (viewMode === 'list') {
    return (
      <tr style={{ cursor:'pointer' }} onClick={()=>window.open(`https://osu.ppy.sh/beatmapsets/${m.id}`,'_blank')}>
        <td>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {cover && <div style={{ width:42, height:30, borderRadius:6, background:`url(${cover}) center/cover`, flexShrink:0 }}/>}
            <div>
              <div style={{ fontWeight:700, fontSize:13 }}>{m.title}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{bm.version} · {m.creator}</div>
            </div>
          </div>
        </td>
        <td><Stars v={stars}/></td>
        <td className="mono" style={{ fontSize:12 }}>{bpm}</td>
        <td className="mono" style={{ fontSize:12 }}>{ar}</td>
        <td className="mono" style={{ fontSize:12 }}>{od}</td>
        <td style={{ fontSize:12, color:'var(--muted)' }}>{length}</td>
        <td style={{ fontSize:11, color:'var(--muted)' }}>▶ {fmt(plays)}</td>
        <td>
          <button className="btn-accent" style={{ padding:'4px 12px', fontSize:11, borderRadius:20 }}
            onClick={e=>{ e.stopPropagation(); onQueue(m); }}>
            {queued?'✓':'+'}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="card map-card fu" style={{ overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column' }}
      onClick={()=>window.open(`https://osu.ppy.sh/beatmapsets/${m.id}`,'_blank')}>

      {/* Cover */}
      <div style={{
        height:90, position:'relative', overflow:'hidden', flexShrink:0,
        background: cover
          ? `url(${cover}) center/cover no-repeat`
          : 'linear-gradient(135deg,var(--dim),var(--bg2))',
      }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.8) 100%)' }}/>
        <span className="mono" style={{
          position:'absolute', top:8, right:8, fontSize:10, fontWeight:800,
          color:'#ffb6d0', background:'rgba(0,0,0,0.6)', borderRadius:10, padding:'2px 8px',
        }}>★ {stars}</span>
        <div style={{ position:'absolute', bottom:7, left:10 }}><Stars v={stars}/></div>
        <span style={{ position:'absolute', bottom:8, right:8, fontSize:9, color:'rgba(255,255,255,0.35)' }}>osu! ↗</span>
      </div>

      <div style={{ padding:'11px 13px', flex:1, display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ fontWeight:800, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.title}</div>
        <div style={{ fontSize:10, color:'var(--muted)' }}>{m.artist}</div>
        <div style={{ fontSize:10, color:'var(--a3)', opacity:0.8 }}>by {m.creator}</div>

        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:2 }}>
          {[`BPM ${bpm}`, `AR ${ar}`, `OD ${od}`, length].map(tag => (
            <span key={tag} className="tag" style={{ fontSize:10 }}>{tag}</span>
          ))}
        </div>
        {plays > 0 && (
          <div style={{ fontSize:10, color:'var(--muted)' }}>▶ {fmt(plays)} plays</div>
        )}

        <button onClick={e=>{ e.stopPropagation(); onQueue(m); }}
          style={{
            marginTop:'auto', width:'100%', padding:'6px', borderRadius:10, border:'1px solid',
            borderColor: queued ? 'rgba(104,216,145,0.4)' : 'var(--border)',
            background:  queued ? 'rgba(104,216,145,0.12)' : 'var(--grad)',
            color:       queued ? '#68d891' : 'white',
            cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:800, transition:'all 0.2s',
          }}>
          {queued ? (lang==='ru'?'✓ Добавлено':'✓ Added') : (lang==='ru'?'+ Очередь':'+ Queue')}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MAP CATALOG – Browse / For You
// ══════════════════════════════════════════════════════════════════════════
export const MapCatalog = ({ user }) => {
  const { lang } = useLang();
  const [tab,   setTab]   = useState('browse');
  const [queue, setQueue] = useState({});
  const [notif, setNotif] = useState(null);

  const onQueue = (m) => {
    const key   = typeof m === 'object' ? (m.id || m.beatmapSetId) : m;
    const title = typeof m === 'object' ? (m.title || '') : '';
    setQueue(prev => ({ ...prev, [key]: !prev[key] }));
    if (!queue[key] && title) setNotif(`${title} ${lang==='ru'?'добавлена в очередь!':'added to queue!'}`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {notif && <Notif msg={notif} onClose={()=>setNotif(null)}/>}

      {/* Tab header */}
      <div style={{ display:'flex', borderBottom:'2px solid var(--border)' }}>
        {[
          { id:'browse', icon:'⊞', en:'Browse',  ru:'Каталог' },
          { id:'foryou', icon:'✦', en:'For You', ru:'Для тебя' },
        ].map(tb => (
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'10px 24px', cursor:'pointer', fontFamily:'inherit',
              fontSize:14, fontWeight:800, border:'none', background:'transparent',
              color:        tab===tb.id ? 'var(--a)' : 'var(--muted)',
              borderBottom: tab===tb.id ? '2px solid var(--a)' : '2px solid transparent',
              marginBottom:'-2px', transition:'color 0.18s',
            }}>
            <span style={{ fontSize:16 }}>{tb.icon}</span>
            {lang==='ru' ? tb.ru : tb.en}
          </button>
        ))}
      </div>

      {tab === 'browse'
        ? <BrowseTab  queue={queue} onQueue={onQueue} lang={lang}/>
        : <ForYouTab  queue={queue} onQueue={onQueue} lang={lang} user={user}/>
      }
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BROWSE TAB – infinite scroll от osu! API
// ══════════════════════════════════════════════════════════════════════════
const BrowseTab = ({ queue, onQueue, lang }) => {
  const [maps,        setMaps]        = useState([]);
  const [cursor,      setCursor]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [hasMore,     setHasMore]     = useState(true);
  const [viewMode,    setViewMode]    = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query,    setQuery]    = useState('');
  const [sortBy,   setSortBy]   = useState('plays_desc');
  const [status,   setStatus]   = useState('ranked');
  const [mods,     setMods]     = useState({ DT:false, HD:false, HR:false, FL:false });
  const [starsMin, setStarsMin] = useState('');
  const [starsMax, setStarsMax] = useState('');
  const [bpmMin,   setBpmMin]   = useState('');
  const [bpmMax,   setBpmMax]   = useState('');
  const [arMin,    setArMin]    = useState('');
  const [arMax,    setArMax]    = useState('');
  const [lenMin,   setLenMin]   = useState('');
  const [lenMax,   setLenMax]   = useState('');

  const loaderRef    = useRef(null);
  const searchTimer  = useRef(null);
  const isLoading    = useRef(false);
  const pendingReset = useRef(false);
  const cursorRef    = useRef(null);
  const activeMods   = Object.entries(mods).filter(([,v])=>v).map(([k])=>k);

  const fetchPage = useCallback(async (fromCursor) => {
    if (isLoading.current) return;
    isLoading.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query.trim()||'', s: status, sort: sortBy, limit:'50' });
      if (fromCursor) params.set('cursor_string', fromCursor);
      const res  = await fetch(`/api/search-maps?${params}`);
      const data = await res.json();
      let items  = data.beatmapsets || [];

      // client-side range filters
      items = items.filter(m => {
        const bm = m.beatmaps?.[0] || {};
        const s  = bm.difficulty_rating ?? 0;
        const b  = m.bpm ?? 0;
        const a  = bm.ar ?? 0;
        const l  = bm.hit_length ?? 0;
        if (starsMin && s < +starsMin) return false;
        if (starsMax && s > +starsMax) return false;
        if (bpmMin   && b < +bpmMin)   return false;
        if (bpmMax   && b > +bpmMax)   return false;
        if (arMin    && a < +arMin)    return false;
        if (arMax    && a > +arMax)    return false;
        if (lenMin   && l < +lenMin*60) return false;
        if (lenMax   && l > +lenMax*60) return false;
        return true;
      });

      if (activeMods.length) items = items.map(m => ({ ...m, _mods: activeMods }));

      setMaps(prev => fromCursor ? [...prev, ...items] : items);
      cursorRef.current = data.cursor_string || null;
      setCursor(data.cursor_string || null);
      setHasMore(!!data.cursor_string);
    } catch(e) { console.error(e); }
    finally { isLoading.current = false; setLoading(false); }
  }, [query, status, sortBy, mods, starsMin, starsMax, bpmMin, bpmMax, arMin, arMax, lenMin, lenMax]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      cursorRef.current = null;
      setCursor(null); setMaps([]); setHasMore(true);
      pendingReset.current = true;
    }, 350);
  }, [query, sortBy, status, mods, starsMin, starsMax, bpmMin, bpmMax, arMin, arMax, lenMin, lenMax]);

  useEffect(() => {
    if (pendingReset.current && !isLoading.current) {
      pendingReset.current = false;
      fetchPage(null);
    }
  });

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading.current) fetchPage(cursorRef.current);
    }, { threshold:0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, fetchPage]);

  const resetFilters = () => {
    setMods({ DT:false, HD:false, HR:false, FL:false });
    setStarsMin(''); setStarsMax('');
    setBpmMin(''); setBpmMax('');
    setArMin(''); setArMax('');
    setLenMin(''); setLenMax('');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Controls */}
      <div className="card" style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input placeholder={`🔍 ${lang==='ru'?'Поиск карт…':'Search maps…'}`} value={query}
            onChange={e=>setQuery(e.target.value)}
            style={{ padding:'9px 14px', flex:1, minWidth:200, fontSize:13 }}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:'9px 12px', fontSize:13 }}>
            <option value="plays_desc">{lang==='ru'?'По популярности':'Most Played'}</option>
            <option value="favourites_desc">{lang==='ru'?'По избранному':'Most Favourited'}</option>
            <option value="ranked_desc">{lang==='ru'?'Новые ранкед':'Recently Ranked'}</option>
            <option value="difficulty_desc">{lang==='ru'?'Звёзды ↓':'Stars ↓'}</option>
            <option value="difficulty_asc">{lang==='ru'?'Звёзды ↑':'Stars ↑'}</option>
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} style={{ padding:'9px 12px', fontSize:13 }}>
            <option value="ranked">Ranked</option>
            <option value="loved">Loved</option>
            <option value="qualified">Qualified</option>
            <option value="any">{lang==='ru'?'Все':'Any'}</option>
          </select>
          <button onClick={()=>setFiltersOpen(v=>!v)} className={filtersOpen?'btn-accent':'btn-ghost'}
            style={{ padding:'7px 14px', fontSize:12, borderRadius:10 }}>
            ⚙ {lang==='ru'?'Фильтры':'Filters'} {filtersOpen?'▲':'▼'}
          </button>
          <div style={{ display:'flex', gap:5 }}>
            {[['grid','⊞'],['list','≡']].map(([v,ic])=>(
              <button key={v} onClick={()=>setViewMode(v)} className="btn-ghost" style={{
                padding:'7px 11px', fontSize:14, borderRadius:8,
                background:viewMode===v?'var(--dim)':'transparent',
                borderColor:viewMode===v?'var(--a)':'var(--border)',
                color:viewMode===v?'var(--a)':'var(--muted)',
              }}>{ic}</button>
            ))}
          </div>
        </div>

        {filtersOpen && (
          <div style={{ padding:'14px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:14, animation:'fadeUp 0.25s ease both' }}>
            {/* Mod toggles */}
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:10, color:'var(--muted)', fontWeight:700, letterSpacing:0.8, textTransform:'uppercase' }}>
                {lang==='ru'?'Моды':'Mods'}
              </span>
              <div style={{ display:'flex', gap:7 }}>
                {['DT','HD','HR','FL'].map(mod => (
                  <button key={mod} onClick={()=>setMods(prev=>({...prev,[mod]:!prev[mod]}))}
                    style={{
                      padding:'5px 18px', borderRadius:8, fontSize:12, fontWeight:800,
                      cursor:'pointer', fontFamily:'inherit', letterSpacing:0.5, border:'1.5px solid',
                      borderColor: mods[mod] ? MOD_TEXT[mod] : 'var(--border)',
                      background:  mods[mod] ? MOD_BG[mod]   : 'transparent',
                      color:       mods[mod] ? MOD_TEXT[mod] : 'var(--muted)',
                      transition:'all 0.18s',
                    }}>{mod}</button>
                ))}
              </div>
            </div>
            {/* Range filters */}
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <RangeInput label={lang==='ru'?'Звёзды':'Stars'} minVal={starsMin} maxVal={starsMax} onMin={setStarsMin} onMax={setStarsMax} step="0.1" placeholder={['0','10']}/>
              <RangeInput label="BPM" minVal={bpmMin} maxVal={bpmMax} onMin={setBpmMin} onMax={setBpmMax} placeholder={['100','300']}/>
              <RangeInput label="AR"  minVal={arMin}  maxVal={arMax}  onMin={setArMin}  onMax={setArMax}  step="0.1" placeholder={['0','10']}/>
              <RangeInput label={lang==='ru'?'Длина (мин)':'Length (min)'} minVal={lenMin} maxVal={lenMax} onMin={setLenMin} onMax={setLenMax} placeholder={['0','10']}/>
            </div>
            <button className="btn-ghost" style={{ padding:'5px 18px', fontSize:12, borderRadius:10, width:'fit-content' }} onClick={resetFilters}>
              ↺ {lang==='ru'?'Сбросить':'Reset'}
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize:12, color:'var(--muted)' }}>
        {lang==='ru'?'Загружено':'Loaded'} <span style={{ color:'var(--a)', fontWeight:700 }}>{maps.length}</span> {lang==='ru'?'карт':'maps'}
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(215px,1fr))', gap:14 }}>
          {maps.map((m,i) => (
            <BrowseCard key={`${m.id}-${i}`} m={m} onQueue={onQueue} queued={!!queue[m.id]} lang={lang} viewMode="grid"/>
          ))}
        </div>
      ) : (
        <div className="card">
          <table>
            <thead><tr>
              <th>{lang==='ru'?'Карта':'Map'}</th>
              <th>{lang==='ru'?'Звёзды':'Stars'}</th>
              <th>BPM</th><th>AR</th><th>OD</th>
              <th>{lang==='ru'?'Длина':'Length'}</th>
              <th>Plays</th><th></th>
            </tr></thead>
            <tbody>
              {maps.map((m,i) => (
                <BrowseCard key={`${m.id}-${i}`} m={m} onQueue={onQueue} queued={!!queue[m.id]} lang={lang} viewMode="list"/>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} style={{ display:'flex', justifyContent:'center', padding:24 }}>
        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--muted)', fontSize:13 }}>
            <div style={{ width:20, height:20, border:'3px solid var(--border)', borderTopColor:'var(--a)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
            {lang==='ru'?'Загрузка...':'Loading...'}
          </div>
        )}
        {!hasMore && maps.length > 0 && (
          <span style={{ fontSize:12, color:'var(--muted)' }}>
            🌸 {lang==='ru'?`${maps.length} карт загружено`:`${maps.length} maps loaded`}
          </span>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FOR YOU TAB — /api/get-recommendations
// Категории: similar, warmup, farm, challenge, reading, speed, aim, stamina
// ══════════════════════════════════════════════════════════════════════════
const ALL_LABELS = ['similar','warmup','farm','challenge','reading','speed','aim','stamina'];

const ForYouTab = ({ queue, onQueue, lang, user }) => {
  const [recs,    setRecs]    = useState([]);
  const [profile, setProfile] = useState(null);
  const [skills,  setSkills]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [activeLabels, setActiveLabels] = useState(new Set());
  const hasFetched = useRef(false);

  const doFetch = useCallback(() => {
    if (!user?.id) return;
    hasFetched.current = true;
    setLoading(true);
    setError(null);

    fetch('/api/get-recommendations', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ userId: user.id, accessToken: user.access_token || null }),
    })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      setRecs(data.recommendations || []);
      setProfile(data.profile || null);
      setSkills(data.skills || null);
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!hasFetched.current) doFetch();
  }, [doFetch]);

  const toggleLabel = lbl => {
    setActiveLabels(prev => {
      const next = new Set(prev);
      if (next.has(lbl)) next.delete(lbl); else next.add(lbl);
      return next;
    });
  };

  const filtered = activeLabels.size === 0
    ? recs
    : recs.filter(m => activeLabels.has(m._label?.toLowerCase()));

  const labelCounts = {};
  recs.forEach(m => { const l = m._label?.toLowerCase()||'other'; labelCounts[l]=(labelCounts[l]||0)+1; });
  const presentLabels = ALL_LABELS.filter(l => labelCounts[l]);

  // Skill name map for weakness display
  const SKILL_NAMES = {
    aim:      { en:'Aim',       ru:'Прицел'       },
    speed:    { en:'Speed',     ru:'Скорость'     },
    accuracy: { en:'Accuracy',  ru:'Точность'     },
    stamina:  { en:'Stamina',   ru:'Выносливость' },
    reading:  { en:'Reading',   ru:'Чтение'       },
    tech:     { en:'Tech',      ru:'Техника'      },
  };
  const SKILL_COLORS = { aim:'#f87171', speed:'#fbbf24', accuracy:'#c084fc', stamina:'#fb923c', reading:'#7eb8f7', tech:'#68d891' };

  if (!user?.id) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontSize:13 }}>
      {lang==='ru'?'Войди через osu! чтобы получить персональные рекомендации':'Login with osu! to get personalized recommendations'}
    </div>
  );

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'60px 0', color:'var(--muted)' }}>
      <div style={{ width:40, height:40, border:'4px solid var(--border)', borderTopColor:'var(--a)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <div style={{ fontSize:14 }}>{lang==='ru'?'Анализируем твои топ-плеи…':'Analysing your top plays…'}</div>
      <div style={{ fontSize:11, opacity:0.6 }}>{lang==='ru'?'Парсим топ-100 + последние 50 скоров':'Parsing top-100 + last 50 scores'}</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
      <div style={{ fontSize:28, marginBottom:12 }}>⚠</div>
      <div style={{ fontSize:14, marginBottom:6 }}>{lang==='ru'?'Не удалось загрузить рекомендации':'Failed to load recommendations'}</div>
      <div style={{ fontSize:11, opacity:0.6, marginBottom:20 }}>{error}</div>
      <button className="btn-accent" style={{ padding:'8px 24px', fontSize:13, borderRadius:10 }}
        onClick={() => { hasFetched.current=false; doFetch(); }}>
        {lang==='ru'?'Попробовать снова':'Retry'}
      </button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Profile summary */}
      {profile && (
        <div className="card fu" style={{ padding:'14px 20px' }}>
          <div style={{ display:'flex', gap:22, flexWrap:'wrap', alignItems:'center' }}>
            {[
              { l:lang==='ru'?'Топ PP':'Top PP',         v:`${Math.round(profile.topPP)}pp`,    c:'var(--a)' },
              { l:lang==='ru'?'Мед. ★':'Med. ★',         v:`★ ${profile.medStars}`,              c:'#fbbf24' },
              { l:lang==='ru'?'Мед. AR':'Med. AR',        v:`AR ${profile.medAR}`,               c:'#7eb8f7' },
              { l:lang==='ru'?'Мед. BPM':'Med. BPM',     v:`${profile.medBPM} BPM`,             c:'#68d891' },
              { l:lang==='ru'?'Точность':'Accuracy',      v:`${profile.avgAcc?.toFixed(1)}%`,    c:'#c084fc' },
            ].map(s => (
              <div key={s.l} style={{ textAlign:'center' }}>
                <div className="mono" style={{ fontSize:15, fontWeight:700, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
            {profile.favMods?.length > 0 && (
              <div style={{ display:'flex', gap:5, alignItems:'center', marginLeft:'auto' }}>
                <span style={{ fontSize:10, color:'var(--muted)' }}>{lang==='ru'?'Моды:':'Fav:'}</span>
                {profile.favMods.map(mod => (
                  <span key={mod} style={{
                    background:MOD_BG[mod]||'var(--dim)', color:MOD_TEXT[mod]||'var(--a3)',
                    borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:800,
                  }}>{mod}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill weaknesses */}
      {skills && (() => {
        const weak = Object.entries(skills).sort((a,b)=>a[1]-b[1]).slice(0,2);
        return weak.length > 0 ? (
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'var(--muted)' }}>{lang==='ru'?'Слабые навыки:':'Weak skills:'}</span>
            {weak.map(([k,v]) => (
              <span key={k} style={{
                background:`${SKILL_COLORS[k]||'var(--a)'}18`,
                color:SKILL_COLORS[k]||'var(--a)',
                border:`1px solid ${SKILL_COLORS[k]||'var(--a)'}30`,
                borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700,
              }}>
                {lang==='ru' ? (SKILL_NAMES[k]?.ru||k) : (SKILL_NAMES[k]?.en||k)} · {Math.round(v)}
              </span>
            ))}
          </div>
        ) : null;
      })()}

      {/* Category chips */}
      {presentLabels.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'var(--muted)' }}>{lang==='ru'?'Категории:':'Filter:'}</span>
          {presentLabels.map(lbl => {
            const lm = getLabel(lbl);
            const active = activeLabels.has(lbl);
            return (
              <button key={lbl} onClick={()=>toggleLabel(lbl)}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'4px 13px', borderRadius:20, border:'1.5px solid', cursor:'pointer',
                  fontFamily:'inherit', fontSize:11, fontWeight:700, transition:'all 0.18s',
                  borderColor: active ? lm.c : 'var(--border)',
                  background:  active ? lm.bg : 'transparent',
                  color:       active ? lm.c  : 'var(--muted)',
                }}>
                {lang==='ru' ? lm.ru : lm.en}
                <span style={{ fontSize:10, opacity:0.65 }}>({labelCounts[lbl]})</span>
              </button>
            );
          })}
          {activeLabels.size > 0 && (
            <button className="btn-ghost" onClick={()=>setActiveLabels(new Set())}
              style={{ padding:'4px 10px', fontSize:11, borderRadius:20 }}>
              ✕
            </button>
          )}
        </div>
      )}

      {/* Count */}
      {recs.length > 0 && (
        <div style={{ fontSize:12, color:'var(--muted)' }}>
          {lang==='ru'?'Показано':'Showing'}{' '}
          <span style={{ color:'var(--a)', fontWeight:700 }}>{filtered.length}</span>
          {lang==='ru'?' из ':' of '}
          <span style={{ color:'var(--a3)', fontWeight:700 }}>{recs.length}</span>
          {' '}{lang==='ru'?'рекомендаций':'recommendations'}
        </div>
      )}

      {/* Cards */}
      {recs.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)', fontSize:13 }}>
          {lang==='ru'?'Нет рекомендаций — сыграй немного карт!':'No recommendations yet — play some maps first!'}
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:13 }}>
            {filtered.map((m,i) => (
              <ForYouCard
                key={`${m.id}-${i}`}
                m={m}
                onQueue={onQueue}
                queued={!!queue[m.id]}
                lang={lang}
                idx={i}
              />
            ))}
          </div>
          <div style={{ textAlign:'center', fontSize:12, color:'var(--muted)', paddingTop:8, borderTop:'1px solid var(--border)' }}>
            🌸 {lang==='ru'
              ? `${filtered.length} рекомендаций на основе анализа твоего стиля`
              : `${filtered.length} recommendations based on your play style`}
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════
export const AdminPanel = () => {
  const { t, lang } = useLang();
  const at = t.admin;
  const [users, setUsers] = useState(ADMIN_USERS);
  const [tab,   setTab]   = useState("users");
  const [search,setSearch]= useState("");
  const [notif, setNotif] = useState(null);
  const notify = msg => { setNotif(msg); setTimeout(()=>setNotif(null),3000); };

  const toggleBan  = id => { setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="banned"?"active":"banned"}:u)); notify(lang==="ru"?"Статус обновлён":"Status updated"); };
  const changeRole = (id,role) => { setUsers(us=>us.map(u=>u.id===id?{...u,role}:u)); notify(lang==="ru"?"Роль обновлена":"Role updated"); };
  const filtered   = users.filter(u=>u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {notif&&<Notif msg={notif} onClose={()=>setNotif(null)}/>}
      <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 className="syne" style={{fontSize:22,fontWeight:800}}>⚙ {at.title}</h2>
          <p style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{at.subtitle}</p>
        </div>
        <span className="tag" style={{background:"rgba(248,113,113,0.12)",borderColor:"rgba(248,113,113,0.3)",color:"#f87171"}}>🔒 {at.adminOnly}</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}} className="fu d1">
        {[
          {l:lang==="ru"?"Пользователей":"Total Users",v:"1,204,832",icon:"👥",c:"var(--a)"},
          {l:lang==="ru"?"Активно":"Active Today",v:"84,291",icon:"🟢",c:"#68d891"},
          {l:lang==="ru"?"Карт":"Maps Indexed",v:"214,930",icon:"♪",c:"#7eb8f7"},
          {l:"API Calls/s",v:"12,450",icon:"⚡",c:"var(--amber)"},
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:"16px 18px"}}>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div className="mono" style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="fu d2" style={{display:"flex",gap:8}}>
        {[["users","👥 "+at.users],["settings","⚙ "+at.settings],["logs","📋 "+at.logs]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className={tab===id?"btn-accent":"btn-ghost"} style={{padding:"7px 18px",fontSize:12,borderRadius:9}}>{label}</button>
        ))}
      </div>

      {tab==="users"&&(
        <div className="card fu d3">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",gap:10,alignItems:"center"}}>
            <input placeholder={`🔍 ${lang==="ru"?"Поиск":"Search"}…`} value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"7px 12px",flex:1}}/>
            <span style={{fontSize:12,color:"var(--muted)"}}>{filtered.length} {lang==="ru"?"польз.":"users"}</span>
          </div>
          <table>
            <thead><tr>
              <th>{lang==="ru"?"Игрок":"User"}</th><th>PP</th>
              <th>{lang==="ru"?"Рейтинг":"Rank"}</th>
              <th>{lang==="ru"?"Роль":"Role"}</th>
              <th>{lang==="ru"?"Статус":"Status"}</th>
              <th></th>
            </tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"var(--bg)",fontWeight:700,flexShrink:0}}>{u.username[0].toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{u.username}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{u.country} · {fmt(u.plays)} plays</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mono" style={{color:"var(--a)",fontWeight:700,fontSize:12}}>{fmt(Math.round(u.pp))}</span></td>
                  <td className="mono" style={{fontSize:12}}>#{fmt(u.rank)}</td>
                  <td>
                    <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)} style={{padding:"3px 8px",fontSize:11}}>
                      {["User","Moderator","Admin"].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>
                    <span style={{display:"flex",alignItems:"center",gap:6}}>
                      <span className={`sdot dot-${u.status}`}/>
                      <span style={{fontSize:12,textTransform:"capitalize"}}>{u.status}</span>
                    </span>
                  </td>
                  <td>
                    <button onClick={()=>toggleBan(u.id)} style={{
                      padding:"3px 12px",borderRadius:7,border:"1px solid",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                      borderColor:u.status==="banned"?"rgba(104,216,145,0.4)":"rgba(248,113,113,0.4)",
                      background:u.status==="banned"?"rgba(104,216,145,0.1)":"rgba(248,113,113,0.1)",
                      color:u.status==="banned"?"#68d891":"#f87171",
                    }}>{u.status==="banned"?(lang==="ru"?"Разбан":"Unban"):(lang==="ru"?"Бан":"Ban")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="settings"&&(
        <div className="card fu d3" style={{padding:26}}>
          <h3 className="syne" style={{fontWeight:700,marginBottom:18,color:"var(--a3)",fontSize:14}}>{lang==="ru"?"Настройки":"Configuration"}</h3>
          {[
            [lang==="ru"?"Лимит API (req/min)":"API Rate Limit (req/min)","60","number"],
            [lang==="ru"?"Макс. PP для рекомендаций":"Max PP for Recs","600","number"],
            [lang==="ru"?"Мин. PP для рекомендаций":"Min PP for Recs","100","number"],
            [lang==="ru"?"Баннер":"Announcement Banner","Welcome to osu!Tracker!","text"],
          ].map(([lbl,def,type])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <label style={{width:240,fontSize:12,color:"var(--muted)",flexShrink:0}}>{lbl}</label>
              <input type={type} defaultValue={def} style={{padding:"7px 12px",flex:1}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn-accent" style={{padding:"8px 22px",fontSize:13,borderRadius:9}} onClick={()=>notify(lang==="ru"?"Сохранено!":"Saved!")}>{at.save}</button>
            <button className="btn-ghost"  style={{padding:"8px 22px",fontSize:13,borderRadius:9}} onClick={()=>notify(lang==="ru"?"Кеш очищен!":"Cache cleared!")}>{at.clearCache}</button>
          </div>
        </div>
      )}

      {tab==="logs"&&(
        <div className="card fu d3">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>
            📋 {lang==="ru"?"Системные логи":"System Logs"}
          </div>
          {[
            {time:"2026-02-25 14:32:11",level:"INFO",msg:"User sakura_beats logged in from JP"},
            {time:"2026-02-25 14:30:55",level:"INFO",msg:"Map catalog refreshed — 214,930 maps indexed"},
            {time:"2026-02-25 14:28:03",level:"WARN",msg:"API rate limit hit for user xXstream_godXx"},
            {time:"2026-02-25 14:20:41",level:"ERROR",msg:"Failed to fetch osu! API — retry in 30s"},
            {time:"2026-02-25 14:15:00",level:"INFO",msg:"Admin updated user role"},
            {time:"2026-02-25 13:55:19",level:"INFO",msg:"Scheduled maintenance completed"},
            {time:"2026-02-25 13:40:02",level:"WARN",msg:"Slow query — map search 2.3s"},
            {time:"2026-02-25 13:20:00",level:"INFO",msg:"Daily stats snapshot saved"},
          ].map((l,i)=>(
            <div key={i} style={{padding:"9px 18px",borderBottom:"1px solid var(--border)",display:"flex",gap:14,alignItems:"center",fontFamily:"monospace",fontSize:11}}>
              <span style={{color:"var(--muted)",flexShrink:0}}>{l.time}</span>
              <span style={{padding:"1px 7px",borderRadius:5,flexShrink:0,fontWeight:700,
                background:l.level==="ERROR"?"rgba(248,113,113,0.15)":l.level==="WARN"?"rgba(251,191,36,0.15)":"rgba(104,216,145,0.1)",
                color:l.level==="ERROR"?"#f87171":l.level==="WARN"?"var(--amber)":"#68d891"
              }}>{l.level}</span>
              <span style={{color:"var(--text)",fontSize:12}}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react'; 
import { useLang, useTheme, fmt, Stars, Notif } from '../App'; 
import { ADMIN_USERS, RECOMMENDED_MAPS, MOCK_PLAYER } from '../constants/mockData'; 



//админпанель как несложно догадаться
export const AdminPanel = () => {
  const { t, lang } = useLang();
  const at = t.admin;
  const [users, setUsers] = useState(ADMIN_USERS);
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState(null);
  const notify = msg => { setNotif(msg); setTimeout(()=>setNotif(null),3000); };

  const toggleBan = id => {
    setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="banned"?"active":"banned"}:u));
    notify(lang==="ru"?"Статус обновлён":"User status updated");
  };
  const changeRole = (id,role) => {
    setUsers(us=>us.map(u=>u.id===id?{...u,role}:u));
    notify(lang==="ru"?"Роль обновлена":"Role updated");
  };
  const filtered = users.filter(u=>u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {notif&&<Notif msg={notif} onClose={()=>setNotif(null)}/>}
      <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 className="syne" style={{fontSize:22,fontWeight:800}}>⚙ {at.title}</h2>
          <p style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{at.subtitle}</p>
        </div>
        <span className="tag" style={{background:"rgba(248,113,113,0.12)",borderColor:"rgba(248,113,113,0.3)",color:"#f87171"}}>
          🔒 {at.adminOnly}
        </span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}} className="fu d1">
        {[
          {l:lang==="ru"?"Пользователей":"Total Users",v:"1,204,832",icon:"👥",c:"var(--a)"},
          {l:lang==="ru"?"Активно сегодня":"Active Today",v:"84,291",icon:"🟢",c:"#68d891"},
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
          <button key={id} onClick={()=>setTab(id)} className={tab===id?"btn-accent":"btn-ghost"}
            style={{padding:"7px 18px",fontSize:12,borderRadius:9}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="users"&&(
        <div className="card fu d3">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",gap:10,alignItems:"center"}}>
            <input placeholder={`🔍 ${lang==="ru"?"Поиск пользователей":"Search users"}…`} value={search}
              onChange={e=>setSearch(e.target.value)} style={{padding:"7px 12px",flex:1}}/>
            <span style={{fontSize:12,color:"var(--muted)"}}>{filtered.length} {lang==="ru"?"польз.":"users"}</span>
          </div>
          <table>
            <thead><tr>
              <th>{lang==="ru"?"Игрок":"User"}</th><th>PP</th>
              <th>{lang==="ru"?"Рейтинг":"Rank"}</th>
              <th>{lang==="ru"?"Роль":"Role"}</th>
              <th>{lang==="ru"?"Статус":"Status"}</th>
              <th>{lang==="ru"?"Действия":"Actions"}</th>
            </tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:"var(--grad)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,color:"var(--bg)",fontWeight:700,flexShrink:0}}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{u.username}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{u.country} · {fmt(u.plays)} {lang==="ru"?"игр":"plays"}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mono" style={{color:"var(--a)",fontWeight:700,fontSize:12}}>{fmt(Math.round(u.pp))}</span></td>
                  <td className="mono" style={{fontSize:12}}>#{fmt(u.rank)}</td>
                  <td>
                    <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                      style={{padding:"3px 8px",fontSize:11}}>
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
          <h3 className="syne" style={{fontWeight:700,marginBottom:18,color:"var(--a3)",fontSize:14}}>
            {lang==="ru"?"Системные настройки":"System Configuration"}
          </h3>
          {[
            [lang==="ru"?"Лимит API (запросов/мин)":"API Rate Limit (req/min)","60","number"],
            [lang==="ru"?"Макс. PP для рекомендаций":"Max PP for Recommendations","600","number"],
            [lang==="ru"?"Мин. PP для рекомендаций":"Min PP for Recommendations","100","number"],
            [lang==="ru"?"Баннер объявления":"Announcement Banner","Welcome to osu!Tracker Pro!","text"],
          ].map(([lbl,def,type])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <label style={{width:260,fontSize:12,color:"var(--muted)",flexShrink:0}}>{lbl}</label>
              <input type={type} defaultValue={def} style={{padding:"7px 12px",flex:1}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn-accent" style={{padding:"8px 22px",fontSize:13,borderRadius:9}} onClick={()=>notify(lang==="ru"?"Настройки сохранены!":"Settings saved!")}>
              {at.save}
            </button>
            <button className="btn-ghost" style={{padding:"8px 22px",fontSize:13,borderRadius:9}} onClick={()=>notify(lang==="ru"?"Кеш очищен!":"Cache cleared!")}>
              {at.clearCache}
            </button>
          </div>
        </div>
      )}

      {tab==="logs"&&(
        <div className="card fu d3">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:14}}>
            📋 {lang==="ru"?"Системные логи":"System Logs"}
            <span style={{fontSize:11,color:"var(--muted)",fontWeight:400,marginLeft:8}}>{lang==="ru"?"Последние 50":"Last 50"}</span>
          </div>
          {[
            {time:"2026-02-25 14:32:11",level:"INFO",msg:"User sakura_beats logged in from JP"},
            {time:"2026-02-25 14:30:55",level:"INFO",msg:"Map catalog refreshed — 214,930 maps indexed"},
            {time:"2026-02-25 14:28:03",level:"WARN",msg:"API rate limit hit for user xXstream_godXx"},
            {time:"2026-02-25 14:20:41",level:"ERROR",msg:"Failed to fetch osu! API — retry in 30s"},
            {time:"2026-02-25 14:15:00",level:"INFO",msg:"Admin CamelliaMaster updated user role"},
            {time:"2026-02-25 13:55:19",level:"INFO",msg:"Scheduled maintenance completed"},
            {time:"2026-02-25 13:40:02",level:"WARN",msg:"Slow query detected — map search 2.3s"},
            {time:"2026-02-25 13:20:00",level:"INFO",msg:"Daily stats snapshot saved"},
          ].map((l,i)=>(
            <div key={i} style={{padding:"9px 18px",borderBottom:"1px solid var(--border)",
              display:"flex",gap:14,alignItems:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>
              <span style={{color:"var(--muted)",flexShrink:0}}>{l.time}</span>
              <span style={{
                padding:"1px 7px",borderRadius:5,flexShrink:0,fontWeight:700,
                background:l.level==="ERROR"?"rgba(248,113,113,0.15)":l.level==="WARN"?"rgba(251,191,36,0.15)":"rgba(104,216,145,0.1)",
                color:l.level==="ERROR"?"#f87171":l.level==="WARN"?"var(--amber)":"#68d891",
              }}>{l.level}</span>
              <span style={{color:"var(--text)",fontSize:12,fontFamily:"'Space Grotesk',sans-serif"}}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


//терь карты

export const MapCatalog = () => {
  const { t, lang } = useLang();
  const mt = t.maps;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("pp");
  const [filterTag, setFilterTag] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [notif, setNotif] = useState(null);
  const allTags = ["All","Aim","Speed","Jump","Stream","Technical","Stamina"];
  const topPP = MOCK_PLAYER.topPlay.pp;

  const maps = RECOMMENDED_MAPS
    .filter(m=>{
      const q=search.toLowerCase();
      return (m.title.toLowerCase().includes(q)||m.artist.toLowerCase().includes(q)||m.mapper.toLowerCase().includes(q))
        && (filterTag==="All"||m.tags.includes(filterTag));
    })
    .sort((a,b)=>sortBy==="pp"?b.pp-a.pp:sortBy==="stars"?b.stars-a.stars:a.title.localeCompare(b.title));

  const visibleMaps = maps;
  const ppTier = (pp) => {
    const d=pp-topPP;
    if(d>50)  return {l:lang==="ru"?"Хард":"Hard Challenge",c:"#f87171",bg:"rgba(248,113,113,0.15)"};
    if(d>0)   return {l:lang==="ru"?"Испытание":"Challenge",c:"var(--amber)",bg:"var(--amberDim)"};
    if(d>-50) return {l:lang==="ru"?"Фарм":"Farm Map",c:"#68d891",bg:"rgba(104,216,145,0.15)"};
    return         {l:lang==="ru"?"Лёгкое":"Comfortable",c:"#7eb8f7",bg:"rgba(126,184,247,0.15)"};
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {notif&&<Notif msg={notif} onClose={()=>setNotif(null)}/>}
      <div className="card fu" style={{padding:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <h2 className="syne" style={{fontSize:20,fontWeight:800}}>♪ {mt.title}</h2>
            <p style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{mt.subtitle} <span style={{color:"var(--a)",fontWeight:700}}>{topPP}pp</span></p>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["grid","⊞"],["list","≡"]].map(([v,ic])=>(
              <button key={v} onClick={()=>setViewMode(v)} className="btn-ghost" style={{
                padding:"6px 12px",fontSize:14,borderRadius:8,
                background:viewMode===v?"var(--dim)":"transparent",
                borderColor:viewMode===v?"var(--a)":"var(--border)",
                color:viewMode===v?"var(--a)":"var(--muted)",
              }}>{ic}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
          <input placeholder={`🔍 ${mt.search}`} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"8px 14px",flex:1,minWidth:200}}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"8px 12px",cursor:"pointer"}}>
            <option value="pp">{mt.sort}: PP</option>
            <option value="stars">{mt.sort}: ★</option>
            <option value="title">{mt.sort}: A-Z</option>
          </select>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {allTags.map(tag=>(
            <button key={tag} onClick={()=>setFilterTag(tag)} style={{
              padding:"3px 12px",borderRadius:20,border:"1px solid",
              borderColor:filterTag===tag?"var(--a)":"var(--border)",
              background:filterTag===tag?"var(--a)":"var(--card2)",
              color:filterTag===tag?"var(--bg)":"var(--muted)",
              cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,transition:"all 0.2s",
            }}>{tag}</button>
          ))}
        </div>
      </div>

      <div style={{fontSize:12,color:"var(--muted)"}} className="fu d1">
        {mt.showing} <span style={{color:"var(--a)",fontWeight:700}}>{visibleMaps.length}</span> {mt.maps}
              </div>

      {viewMode==="grid"?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}
          className="">
          {visibleMaps.map((m,i)=>{
            const tier=ppTier(m.pp);
            return (
              <div key={m.id} className="card map-card fu" style={{animationDelay:`${i*0.04}s`,overflow:"hidden",cursor:"pointer"}}
                onClick={()=>window.open(`https://osu.ppy.sh/beatmapsets/${m.beatmapSetId}`,"_blank")}>
                <div style={{
                  height:88,background:`linear-gradient(135deg,${tier.bg},var(--bg2))`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"2rem",position:"relative",overflow:"hidden",
                }}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,var(--dim),transparent)"}}/>
                  <span style={{fontSize:32,opacity:0.7}}>♪</span>
                  <div style={{position:"absolute",top:8,right:8}}>
                    <span style={{background:tier.bg,color:tier.c,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{tier.l}</span>
                  </div>
                  <span style={{position:"absolute",bottom:6,right:10,fontSize:10,color:"var(--muted)",opacity:0.8}}>osu! ↗</span>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>by {m.artist}</div>
                  <div style={{fontSize:10,color:"var(--a3)",marginTop:1}}>mapped by {m.mapper}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                    <Stars v={m.stars}/>
                    <span className="mono" style={{color:"var(--a)",fontWeight:700,fontSize:15}}>{m.pp}pp</span>
                  </div>
                  <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                    {[`AR ${m.ar}`,`OD ${m.od}`,`BPM ${m.bpm}`,m.length].map(t=>(
                      <span key={t} className="tag" style={{fontSize:10}}>{t}</span>
                    ))}
                  </div>
                  <button className="btn-accent" style={{width:"100%",padding:"7px",marginTop:12,fontSize:12,borderRadius:8}}
                    onClick={()=>setNotif(`${m.title} ${lang==="ru"?"добавлена в очередь!":"added to queue!"}`)}>
                    {mt.addQueue} {lang==="ru"?"В очередь":"Queue"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ):(
        <div className="card fu d2">
          <table>
            <thead>
              <tr>
                <th>{lang==="ru"?"Карта":"Map"}</th>
                <th>{lang==="ru"?"Звёзды":"Stars"}</th>
                <th>PP</th><th>BPM</th><th>AR</th>
                <th>{lang==="ru"?"Длина":"Length"}</th>
                <th>{lang==="ru"?"Уровень":"Tier"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleMaps.map(m=>{
                const tier=ppTier(m.pp);
                return (
                  <tr key={m.id} style={{cursor:"pointer"}}
                    onClick={()=>window.open(`https://osu.ppy.sh/beatmapsets/${m.beatmapSetId}`,"_blank")}>
                    <td>
                      <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                        {m.title}
                        <span style={{fontSize:10,color:"var(--muted)",opacity:0.7}}>↗</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--muted)"}}>{m.diff} · {m.mapper}</div>
                    </td>
                    <td><Stars v={m.stars}/></td>
                    <td><span className="mono" style={{color:"var(--a)",fontWeight:700}}>{m.pp}</span></td>
                    <td className="mono" style={{fontSize:12}}>{m.bpm}</td>
                    <td className="mono" style={{fontSize:12}}>{m.ar}</td>
                    <td style={{fontSize:12,color:"var(--muted)"}}>{m.length}</td>
                    <td><span style={{background:tier.bg,color:tier.c,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{tier.l}</span></td>
                    <td>
                      <button className="btn-accent" style={{padding:"4px 12px",fontSize:11,borderRadius:20}}
                        onClick={e=>{e.stopPropagation();setNotif(`${m.title} ${lang==="ru"?"добавлена!":"added!"}`)}}>
                        {mt.addQueue}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
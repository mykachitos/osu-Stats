import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
} from "recharts";

/* ══════════════════════════════════════════
   TRANSLATION SYSTEM
══════════════════════════════════════════ */
const T = {
  en: {
    nav: { dashboard:"Dashboard", profile:"Profile", stats:"Statistics", maps:"Maps", admin:"Admin", home:"Home" },
    landing: {
      hero1:"Level Up Your", hero2:"osu! Game",
      heroSub:"AI-powered statistics, personalised map recommendations and deep performance analytics — built for serious players.",
      loginBtn:"Login with osu!",
      featTitle:"Everything You Need to Improve",
      feat1t:"Smart Recommendations", feat1d:"Our algorithm analyses your play history, identifies weak points and suggests maps that will push your limits.",
      feat2t:"Deep Analytics", feat2d:"Track every metric — PP progress, rank history, accuracy trends, skill breakdown and session data.",
      feat3t:"Skill Profiler", feat3d:"Understand your playstyle. Aim, Speed, Accuracy, Stamina, Reading, Tech — all scored and visualised.",
      cta:"Get Started Free",
      footer:"Built for the community · Not affiliated with osu! or ppy Pty Ltd",
    },
    dash: {
      welcome:"Welcome back,", ppProgress:"PP Progress", skillRadar:"Skill Radar",
      grades:"Grades", recentPlays:"Recent Plays", mapsForYou:"Maps For You",
      basedOn:"Based on your top play —", viewAll:"View full catalog →",
      addQueue:"+ Add to Queue", added:"✓ Added",
      filters:["All","Farm","Challenge","Hard"],
    },
    profile: { edit:"Edit Profile", save:"Save Changes", cancel:"Cancel",
      stats:"Account Statistics", topPlay:"Top Performance", level:"Level Progress",
      grades:"Grade Distribution", since:"Member since",
    },
    stats: { title:"Statistics Overview", last7:"Last 7 Days", improving:"↑ Improving",
      rankHistory:"Global Rank History", playsDay:"Plays per Day", ppDay:"PP Gained per Day",
      skillBreak:"Skill Breakdown",
    },
    maps: { title:"Map Catalog", subtitle:"Tailored for your top play of",
      search:"Search maps, artists, mappers…", sort:"Sort", grid:"Grid", list:"List",
      showing:"Showing", maps:"maps", addQueue:"+ Add", added:"✓",
    },
    admin: { title:"Admin Panel", subtitle:"Manage users, maps and system settings",
      adminOnly:"Admin Only", users:"Users", settings:"Settings", logs:"Logs",
      save:"Save Settings", clearCache:"Clear Cache",
    },
    common: { online:"Online", logout:"Logout", language:"Language",
      theme:"Theme", customize:"Customize",
    },
  },
  ru: {
    nav: { dashboard:"Дашборд", profile:"Профиль", stats:"Статистика", maps:"Карты", admin:"Панель", home:"Главная" },
    landing: {
      hero1:"Прокачай своё", hero2:"osu! мастерство",
      heroSub:"ИИ-статистика, персональные рекомендации карт и глубокая аналитика — для серьёзных игроков.",
      loginBtn:"Войти через osu!",
      featTitle:"Всё для улучшения игры",
      feat1t:"Умные рекомендации", feat1d:"Алгоритм анализирует историю игр, находит слабые места и предлагает карты, которые прокачают ваши навыки.",
      feat2t:"Глубокая аналитика", feat2d:"Отслеживай каждую метрику — PP, рейтинг, точность, навыки и данные сессий.",
      feat3t:"Профилировщик навыков", feat3d:"Пойми свой стиль игры. Прицел, Скорость, Точность, Выносливость, Чтение, Техника — всё с визуализацией.",
      cta:"Get Started Free",
      footer:"Создано для сообщества · Не аффилировано с osu! и ppy Pty Ltd",
    },
    dash: {
      welcome:"С возвращением,", ppProgress:"PP Прогресс", skillRadar:"Радар навыков",
      grades:"Грейды", recentPlays:"Последние игры", mapsForYou:"Карты для тебя",
      basedOn:"По твоему лучшему результату —", viewAll:"Полный каталог →",
      addQueue:"+ В очередь", added:"✓ Добавлено",
      filters:["Все","Фарм","Испытание","Хард"],
    },
    profile: { edit:"Редактировать", save:"Сохранить", cancel:"Отмена",
      stats:"Статистика аккаунта", topPlay:"Лучший результат", level:"Уровень",
      grades:"Распределение грейдов", since:"Игрок с",
    },
    stats: { title:"Обзор статистики", last7:"Последние 7 дней", improving:"↑ Улучшается",
      rankHistory:"История глобального рейтинга", playsDay:"Игр в день", ppDay:"PP в день",
      skillBreak:"Детализация навыков",
    },
    maps: { title:"Каталог карт", subtitle:"По твоему лучшему результату",
      search:"Поиск карт, исполнителей, мапперов…", sort:"Сорт.", grid:"Сетка", list:"Список",
      showing:"Показано", maps:"карт", addQueue:"+ Добавить", added:"✓",
    },
    admin: { title:"Панель администратора", subtitle:"Управление пользователями, картами и настройками",
      adminOnly:"Только для админов", users:"Пользователи", settings:"Настройки", logs:"Логи",
      save:"Сохранить", clearCache:"Очистить кеш",
    },
    common: { online:"Онлайн", logout:"Выйти", language:"Язык",
      theme:"Тема", customize:"Настроить",
    },
  },
};

const LangCtx = createContext({ lang:"en", t:T.en, setLang:()=>{} });
const useLang = () => useContext(LangCtx);

/* ══════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════ */
const THEMES = {
  midnight: {
    name:"Sakura Night", nameRu:"Сакура Ночь",
    bg:"#0d0810", bg2:"#130c1a", bg3:"#1a1024",
    card:"#1a1025", card2:"#221535",
    border:"rgba(255,138,195,0.18)",
    accent:"#ff6eb4", accent2:"#d44f8e", accent3:"#ffb3d9",
    accentGlow:"rgba(255,110,180,0.28)", accentDim:"rgba(255,110,180,0.08)",
    amber:"#ffcdd2", amberDim:"rgba(255,182,193,0.12)",
    text:"#f5e6f0", muted:"#8e7a9a",
    gradient:"linear-gradient(135deg, #ff6eb4, #d44f8e)",
  },
  obsidian: {
    name:"Lavender Dream", nameRu:"Сон Лаванды",
    bg:"#09080f", bg2:"#100e1a", bg3:"#161428",
    card:"#141228", card2:"#1c1a38",
    border:"rgba(186,140,255,0.18)",
    accent:"#ba8cff", accent2:"#8b5cf6", accent3:"#dbbfff",
    accentGlow:"rgba(186,140,255,0.28)", accentDim:"rgba(186,140,255,0.08)",
    amber:"#ffd6e7", amberDim:"rgba(255,182,193,0.12)",
    text:"#ede8ff", muted:"#7c6aaa",
    gradient:"linear-gradient(135deg, #ba8cff, #8b5cf6)",
  },
  ember: {
    name:"Peach Blossom", nameRu:"Персиковый Цвет",
    bg:"#0f090c", bg2:"#1a0d12", bg3:"#21101a",
    card:"#1e1018", card2:"#2a1520",
    border:"rgba(255,150,170,0.18)",
    accent:"#ff96aa", accent2:"#e05575", accent3:"#ffccd8",
    accentGlow:"rgba(255,150,170,0.28)", accentDim:"rgba(255,150,170,0.08)",
    amber:"#ffd6e7", amberDim:"rgba(255,193,210,0.12)",
    text:"#fff0f3", muted:"#9a7080",
    gradient:"linear-gradient(135deg, #ff96aa, #e05575)",
  },
};

const ThemeCtx = createContext({ theme:THEMES.midnight, themeKey:"midnight", setTheme:()=>{} });
const useTheme = () => useContext(ThemeCtx);

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

const ThemeSwitcher = () => {
  const { themeKey, setTheme } = useTheme();
  const { lang } = useLang();
  return (
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      {Object.entries(THEMES).map(([k,th])=>(
        <button key={k} onClick={()=>setTheme(k)}
          title={lang==="ru"?th.nameRu:th.name}
          style={{
            width:22,height:22,borderRadius:"50%",
            border:`2px solid ${themeKey===k?th.accent:"transparent"}`,
            background:th.gradient,cursor:"pointer",transition:"border 0.2s",
          }}/>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════ */
const MOCK_PLAYER = {
  id: 7654321, username:"sakura_beats", country:"JP", countryFlag:"🇯🇵",
  globalRank:14320, countryRank:832, pp:4287.6, accuracy:97.34,
  level:87, levelProgress:63, playCount:18430, playTime:"2847h",
  rankedScore:2841930000, totalScore:8103291000, maxCombo:2148,
  grades:{ SSH:12, SS:87, SH:43, S:312, A:691 },
  joined:"12 March 2019", badges:["osu!supporter","Mapper","Contributor"],
  topPlay:{ map:"Harumachi Clover", pp:412.4, stars:6.21 },
  rankHistory:[
    {date:"Jan",rank:18000},{date:"Feb",rank:17200},{date:"Mar",rank:16100},
    {date:"Apr",rank:15800},{date:"May",rank:15100},{date:"Jun",rank:14900},{date:"Jul",rank:14320}
  ],
  ppHistory:[
    {date:"Jan",pp:3800},{date:"Feb",pp:3940},{date:"Mar",pp:4050},
    {date:"Apr",pp:4120},{date:"May",pp:4180},{date:"Jun",pp:4240},{date:"Jul",pp:4287}
  ],
  recentActivity:[
    {map:"Senbonzakura",diff:"Insane",pp:180,acc:98.4,rank:"S",stars:5.2,date:"2h ago"},
    {map:"Freedom Dive",diff:"FOUR DIMENSIONS",pp:0,acc:94.1,rank:"A",stars:8.9,date:"5h ago"},
    {map:"Harumachi Clover",diff:"Fragrance",pp:412,acc:99.1,rank:"SS",stars:6.21,date:"1d ago"},
    {map:"Lovely Icecream",diff:"Extra",pp:220,acc:97.8,rank:"S",stars:5.8,date:"2d ago"},
    {map:"Blue Zenith",diff:"FOUR DIMENSIONS",pp:0,acc:91.2,rank:"A",stars:7.6,date:"3d ago"},
  ],
};

const RECOMMENDED_MAPS = [
  {id:1,beatmapSetId:751882,title:"Harumachi Clover",artist:"Yuki Yuki",diff:"Fragrance",mapper:"Sotarks",stars:6.21,pp:412,bpm:170,ar:9.2,od:9,cs:4,length:"3:42",tags:["Jump","Stream"]},
  {id:2,beatmapSetId:128931,title:"Senbonzakura",artist:"Hatsune Miku",diff:"Insane",mapper:"xChippy",stars:5.2,pp:195,bpm:155,ar:9,od:8.5,cs:4,length:"4:10",tags:["Aim","Alternating"]},
  {id:3,beatmapSetId:1358449,title:"Lovely Icecream",artist:"Kobaryo",diff:"Extra",mapper:"snowball112",stars:5.8,pp:230,bpm:190,ar:9.3,od:9,cs:4,length:"2:28",tags:["Speed","Burst"]},
  {id:4,beatmapSetId:1001460,title:"Zetsubou no Shima",artist:"xi",diff:"EXHAUST",mapper:"Nakagawa-Kanon",stars:6.05,pp:390,bpm:185,ar:9.4,od:8.8,cs:4.2,length:"5:02",tags:["Technical","Complex"]},
  {id:5,beatmapSetId:1010865,title:"Camellia as Reverse of Riot",artist:"Camellia",diff:"Ground Assault",mapper:"Regou",stars:5.65,pp:260,bpm:175,ar:9.1,od:9,cs:4,length:"4:30",tags:["Aim","Stamina"]},
  {id:6,beatmapSetId:1257904,title:"Yoru ni Kakeru",artist:"YOASOBI",diff:"Voyage",mapper:"Delis",stars:5.5,pp:215,bpm:132,ar:9,od:8.5,cs:4,length:"4:18",tags:["Aim","Sliders"]},
  {id:7,beatmapSetId:1148213,title:"Goodbye Halcyon Days",artist:"t+pazolite",diff:"Daybreak",mapper:"handsome",stars:6.3,pp:445,bpm:210,ar:9.5,od:9.2,cs:4.3,length:"3:10",tags:["Technical","Speed"]},
  {id:8,beatmapSetId:577524,title:"Gensokyo Millenium",artist:"Silver Forest",diff:"Extra",mapper:"Halfslashed",stars:5.3,pp:188,bpm:165,ar:9,od:8,cs:4,length:"4:50",tags:["Aim","Jump"]},
  {id:9,beatmapSetId:374119,title:"Kira Kira Sensation",artist:"Love Live",diff:"Miracle",mapper:"alacat",stars:4.8,pp:155,bpm:150,ar:8.8,od:8.2,cs:4,length:"3:55",tags:["Aim","Easy Slider"]},
  {id:10,beatmapSetId:963951,title:"Conflict",artist:"Yuki Kajiura",diff:"Extreme",mapper:"PoNo",stars:6.4,pp:480,bpm:200,ar:9.6,od:9.5,cs:4.5,length:"2:50",tags:["Speed","Burst","Technical"]},
  {id:11,beatmapSetId:320118,title:"Sugar Song to Bitter Step",artist:"UNISON SQUARE GARDEN",diff:"Collab Extra",mapper:"Kibbleru",stars:5.7,pp:245,bpm:158,ar:9.1,od:9,cs:4,length:"4:05",tags:["Aim","Sliders"]},
  {id:12,beatmapSetId:461744,title:"Sayonara Memory",artist:"SKE48",diff:"Expert",mapper:"DeRandom",stars:5.0,pp:170,bpm:165,ar:9,od:8.5,cs:4,length:"3:30",tags:["Aim","Linear"]},
];

const ADMIN_USERS = [
  {id:1,username:"sakura_beats",pp:4287,rank:14320,status:"active",role:"User",country:"JP",joined:"2019-03-12",plays:18430},
  {id:2,username:"moonlight_aim",pp:6120,rank:4890,status:"active",role:"Moderator",country:"KR",joined:"2018-07-22",plays:31200},
  {id:3,username:"xXstream_godXx",pp:2100,rank:42000,status:"banned",role:"User",country:"US",joined:"2021-01-05",plays:8900},
  {id:4,username:"CamelliaMaster",pp:8900,rank:1230,status:"active",role:"Admin",country:"PL",joined:"2016-09-30",plays:76000},
  {id:5,username:"aim_trainer99",pp:3450,rank:22100,status:"active",role:"User",country:"DE",joined:"2020-05-18",plays:14500},
  {id:6,username:"nyan_desu",pp:1800,rank:68000,status:"inactive",role:"User",country:"JP",joined:"2022-02-28",plays:4300},
];

/* ══════════════════════════════════════════
   STATS ALGORITHM
   Generates skill scores from play data
══════════════════════════════════════════ */
function computeSkills(player) {
  const { accuracy, pp, maxCombo, playCount, recentActivity, topPlay } = player;
  const recentAvgAcc = recentActivity.reduce((s,p)=>s+p.acc,0)/recentActivity.length;
  const recentAvgStars = recentActivity.reduce((s,p)=>s+p.stars,0)/recentActivity.length;
  const highStarPlays = recentActivity.filter(p=>p.stars>=6).length;
  const hasHighBPM = recentActivity.some(p=>p.diff.includes("DIMENSIONS")||p.diff.includes("Extra"));
  const ppFactor = Math.min(100, (pp / 100));
  
  const aim      = Math.round(Math.min(99, 40 + (topPlay.stars / 10)*40 + (recentAvgAcc-90)*1.5 + highStarPlays*3));
  const speed    = Math.round(Math.min(99, 35 + (hasHighBPM?15:0) + ppFactor*0.4 + recentAvgStars*5));
  const accScore = Math.round(Math.min(99, (recentAvgAcc - 88) * 5.5 + 20));
  const stamina  = Math.round(Math.min(99, 30 + (playCount / 500) + (recentActivity.filter(p=>p.acc>96).length)*6));
  const reading  = Math.round(Math.min(99, 40 + recentAvgStars*6 + (accuracy-90)*1.2));
  const tech     = Math.round(Math.min(99, 35 + (recentActivity.filter(p=>p.diff.includes("Technical")||p.diff.includes("EXHAUST")).length)*10 + ppFactor*0.3));
  
  return [
    { skill:"Aim",      skillRu:"Прицел",     value:Math.max(20,aim) },
    { skill:"Speed",    skillRu:"Скорость",   value:Math.max(20,speed) },
    { skill:"Accuracy", skillRu:"Точность",   value:Math.max(20,accScore) },
    { skill:"Stamina",  skillRu:"Выносливость",value:Math.max(20,stamina) },
    { skill:"Reading",  skillRu:"Чтение",     value:Math.max(20,reading) },
    { skill:"Tech",     skillRu:"Техника",    value:Math.max(20,tech) },
  ];
}

function computePPTrend(player) {
  return player.ppHistory.map((h,i)=>({
    ...h,
    delta: i>0 ? h.pp - player.ppHistory[i-1].pp : 0,
  }));
}

function recommendMaps(player, maps) {
  const topPP = player.topPlay.pp;
  const skills = computeSkills(player);
  const weakSkill = skills.slice().sort((a,b)=>a.value-b.value)[0];
  
  return maps
    .map(m => {
      const ppDiff = m.pp - topPP;
      const matchesWeak = m.tags.some(t=>t.toLowerCase().includes(weakSkill.skill.toLowerCase().slice(0,3)));
      const farmScore = ppDiff > -100 && ppDiff < 80 ? 1 : 0;
      const score = farmScore + (matchesWeak ? 0.5 : 0) + (1 - Math.abs(ppDiff)/500);
      return { ...m, score, ppDiff, matchesWeak };
    })
    .sort((a,b)=>b.score-a.score);
}

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700;800&family=Nunito:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    :root {
      --bg:${theme.bg}; --bg2:${theme.bg2}; --bg3:${theme.bg3};
      --card:${theme.card}; --card2:${theme.card2};
      --border:${theme.border};
      --a:${theme.accent}; --a2:${theme.accent2}; --a3:${theme.accent3};
      --glow:${theme.accentGlow}; --dim:${theme.accentDim};
      --amber:${theme.amber}; --amberDim:${theme.amberDim};
      --text:${theme.text}; --muted:${theme.muted};
      --grad:${theme.gradient};
    }
    html,body,#root { height:100%; }
    body { font-family:'Nunito',sans-serif; background:var(--bg); color:var(--text); overflow-x:hidden; transition: background 0.4s, color 0.4s; }

    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:var(--bg2); }
    ::-webkit-scrollbar-thumb { background:var(--a2); border-radius:10px; }

    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none} }
    @keyframes fadeIn { from{opacity:0}to{opacity:1} }
    @keyframes sakuraDrift { 0%{transform:translateY(-10px) rotate(0deg);opacity:0} 10%{opacity:0.7} 90%{opacity:0.5} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
    @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 var(--glow)}50%{box-shadow:0 0 0 8px rgba(0,0,0,0)} }
    @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
    @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes softPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
    @keyframes petalSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} 100%{transform:rotate(360deg) scale(1)} }

    .fu  { animation:fadeUp 0.45s cubic-bezier(.34,1.4,.64,1) both; }
    .d1  { animation-delay:0.05s; } .d2  { animation-delay:0.1s; }
    .d3  { animation-delay:0.15s; } .d4  { animation-delay:0.2s; }
    .d5  { animation-delay:0.25s; } .d6  { animation-delay:0.3s; }

    .mono { font-family:'Share Tech Mono',monospace; }
    .syne { font-family:'M PLUS Rounded 1c',sans-serif; }

    /* Accent text */
    .accent-text {
      background:linear-gradient(90deg,var(--a),var(--a3),var(--a));
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      animation:shimmer 4s linear infinite;
    }

    /* Cards - soft rounded anime */
    .card {
      background:var(--card); border:1px solid var(--border);
      border-radius:22px; transition:border-color 0.25s, box-shadow 0.25s;
    }
    .glass {
      background:rgba(255,255,255,0.04); backdrop-filter:blur(20px);
      border:1px solid var(--border); border-radius:22px;
    }

    /* Buttons - bouncy & round */
    .btn-accent {
      background:var(--grad); border:none;
      color:white; font-family:'Nunito',sans-serif;
      font-weight:800; cursor:pointer; border-radius:50px;
      transition:all 0.22s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden;
    }
    .btn-accent:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 10px 28px var(--glow); }
    .btn-accent:active { transform:scale(0.97); }
    .btn-ghost {
      background:transparent; border:1.5px solid var(--border);
      color:var(--muted); font-family:'Nunito',sans-serif;
      font-weight:700; cursor:pointer; border-radius:50px;
      transition:all 0.2s;
    }
    .btn-ghost:hover { border-color:var(--a); color:var(--a); background:var(--dim); }

    /* Tags & badges */
    .tag {
      display:inline-flex; align-items:center; gap:4px;
      background:var(--dim); border:1px solid var(--border);
      color:var(--a3); border-radius:20px;
      font-size:11px; font-weight:700; padding:2px 10px; letter-spacing:0.3px;
    }
    .rank-SSH{background:rgba(255,215,0,0.18);color:#ffd700;border:1px solid rgba(255,215,0,0.3);border-radius:20px;}
    .rank-SS {background:rgba(255,215,0,0.12);color:#f0c040;border:1px solid rgba(255,215,0,0.22);border-radius:20px;}
    .rank-S  {background:var(--dim);color:var(--a3);border:1px solid var(--border);border-radius:20px;}
    .rank-SH {background:rgba(192,192,192,0.15);color:#c0c0c0;border:1px solid rgba(192,192,192,0.25);border-radius:20px;}
    .rank-A  {background:rgba(80,200,120,0.12);color:#68d891;border:1px solid rgba(80,200,120,0.22);border-radius:20px;}
    .rank-B  {background:rgba(100,160,255,0.12);color:#7eb8f7;border:1px solid rgba(100,160,255,0.22);border-radius:20px;}
    .rank-badge{font-family:'Share Tech Mono',monospace;font-size:11px;padding:2px 10px;border-radius:20px;display:inline-block;}

    /* Inputs */
    input, select {
      background:var(--card2); border:1.5px solid var(--border);
      color:var(--text); font-family:'Nunito',sans-serif;
      font-size:14px; border-radius:14px; outline:none;
      transition:border-color 0.2s;
    }
    input:focus, select:focus { border-color:var(--a); box-shadow:0 0 0 4px var(--dim); }

    /* Progress */
    .pb-wrap { height:6px; background:var(--bg2); border-radius:20px; overflow:hidden; }
    .pb { height:100%; border-radius:20px; background:var(--grad); box-shadow:0 0 8px var(--glow); transition:width 1.2s cubic-bezier(.22,.61,.36,1); }

    /* Sidebar nav */
    .nav-item {
      display:flex; align-items:center; gap:12px;
      padding:9px 14px; border-radius:14px;
      color:var(--muted); font-weight:700; font-size:13px;
      cursor:pointer; transition:all 0.2s; border:1px solid transparent;
    }
    .nav-item:hover { background:var(--dim); color:var(--a3); transform:translateX(3px); }
    .nav-item.active {
      background:linear-gradient(90deg,var(--dim),transparent);
      color:var(--a); border-color:var(--border);
      border-left:3px solid var(--a);
    }

    /* Status dots */
    .dot-active  { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.5); }
    .dot-inactive { background:#64748b; }
    .dot-banned  { background:#f87171; box-shadow:0 0 6px rgba(248,113,113,0.5); }
    .sdot { width:7px; height:7px; border-radius:50%; display:inline-block; }

    /* Notification */
    .notif {
      position:fixed; top:20px; right:20px; z-index:9999;
      background:var(--card2); border:1.5px solid var(--a);
      border-radius:18px; padding:12px 20px;
      font-size:13px; font-weight:700; color:var(--a3);
      box-shadow:0 4px 24px var(--glow);
      animation:fadeUp 0.4s ease;
    }

    /* Map cards */
    .map-card { transition:transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s; }
    .map-card:hover { transform:translateY(-7px) scale(1.01); box-shadow:0 20px 50px rgba(0,0,0,0.45); }

    /* Soft dot bg (anime style) */
    .grid-bg {
      position:fixed; inset:0; z-index:0; pointer-events:none; opacity:0.04;
      background-image: radial-gradient(circle, var(--a) 1px, transparent 1px);
      background-size:30px 30px;
    }

    /* Sakura petals floating */
    .sakura-petal {
      position:fixed; pointer-events:none; z-index:0;
      animation:sakuraDrift linear infinite; opacity:0;
      font-size:14px; user-select:none;
    }

    /* Orbs */
    .orb { position:fixed; border-radius:50%; pointer-events:none; filter:blur(90px); z-index:0; }

    /* Table */
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; padding:10px 14px; font-size:11px; font-weight:800;
         color:var(--muted); text-transform:uppercase; letter-spacing:1.2px;
         border-bottom:1px solid var(--border); }
    td { padding:11px 14px; font-size:13.5px; border-bottom:1px solid rgba(255,255,255,0.04); }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:var(--dim); }


    /* Landing */
    .hero-title { font-family:'M PLUS Rounded 1c',sans-serif; font-weight:800; line-height:1.1; }
    .feature-card { 
      background:var(--card); border:1px solid var(--border);
      border-radius:24px; padding:28px; position:relative; overflow:hidden;
      transition:transform 0.3s cubic-bezier(.34,1.4,.64,1), border-color 0.25s, box-shadow 0.3s;
    }
    .feature-card:hover { transform:translateY(-8px); border-color:var(--a); box-shadow:0 20px 50px var(--glow); }
    .feature-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:3px;
      background:var(--grad); border-radius:3px 3px 0 0;
    }


    /* osu link hover */
    .osu-link:hover { opacity:0.85; }

    @media (max-width:768px) {
      .sidebar { transform:translateX(-100%); position:fixed !important; z-index:200; transition:transform 0.3s; }
      .sidebar.open { transform:none; }
      .mcol { margin-left:0 !important; }
    }
  `}</style>
);

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const fmt = n => n?.toLocaleString() ?? "—";
const Stars = ({ v }) => (
  <span className="mono" style={{fontSize:12,color:"#ffb6d0",letterSpacing:1}}>
    ✦ {v.toFixed(2)}
  </span>
);
const Notif = ({ msg, onClose }) => {
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
const Landing = ({ onLogin }) => {
  const { t } = useLang();
  const { theme } = useTheme();
  const lt = t.landing;
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{minHeight:"100vh", position:"relative", overflow:"hidden"}}>
      {/* Background effects */}
      <div className="grid-bg"/>
      <SakuraPetals/>
      <div className="orb" style={{width:600,height:600,background:`radial-gradient(circle,${theme.accentDim.replace("0.07","0.15")} 0%,transparent 70%)`,top:-200,right:-100}}/>
      <div className="orb" style={{width:400,height:400,background:`radial-gradient(circle,rgba(255,182,193,0.08) 0%,transparent 70%)`,bottom:100,left:-150}}/>

      {/* Navbar */}
      <nav style={{
        position:"sticky",top:0,zIndex:100,padding:"0 5%",
        height:64,display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"rgba(7,11,20,0.7)",backdropFilter:"blur(16px)",
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

      {/* Hero */}
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

        {/* Stats bar */}
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

      {/* Features */}
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

      {/* Footer */}
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0=prompt, 1=loading, 2=success

  const handleLogin = () => {
    setStep(1);
    setTimeout(()=>{ setStep(2); setTimeout(()=>{ onSuccess(); onClose(); },800); },1500);
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
   SIDEBAR
══════════════════════════════════════════ */
const NAV_ITEMS = (t) => [
  {id:"dashboard",icon:"⊞",label:t.nav.dashboard},
  {id:"profile",  icon:"◉",label:t.nav.profile},
  {id:"stats",    icon:"◈",label:t.nav.stats},
  {id:"maps",     icon:"♪",label:t.nav.maps},
  {id:"admin",    icon:"⚙",label:t.nav.admin},
];

const Sidebar = ({ page, setPage, open }) => {
  const { t } = useLang();
  const { theme, themeKey, setTheme } = useTheme();
  const navItems = NAV_ITEMS(t);
  return (
    <aside className={`sidebar ${open?"open":""}`} style={{
      width:220,minHeight:"100vh",background:"var(--bg2)",
      borderRight:"1px solid var(--border)",padding:"20px 10px",
      display:"flex",flexDirection:"column",gap:4,
      position:"sticky",top:0,flexShrink:0,
    }}>
      {/* Logo */}
      <div style={{padding:"4px 12px 20px",borderBottom:"1px solid var(--border)",marginBottom:4}}>
        <div className="syne" style={{fontSize:19,fontWeight:800,letterSpacing:-0.5}}>
          <span className="accent-text">osu!</span><span>Tracker</span>
        </div>
        <div style={{fontSize:10,color:"var(--muted)",letterSpacing:2,marginTop:1}}>🌸 ANALYTICS PRO</div>
      </div>

      {navItems.map(n=>(
        <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
          <span style={{fontSize:15,width:18,textAlign:"center"}}>{n.icon}</span>
          <span>{n.label}</span>
          {page===n.id&&<span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"var(--a)",boxShadow:"0 0 6px var(--a)"}}/>}
        </div>
      ))}

      {/* Theme switcher - free for all */}
      <div style={{margin:"8px 0",borderRadius:10,padding:"10px 12px",background:"var(--dim)",border:"1px solid var(--border)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--a)",marginBottom:6,letterSpacing:1}}>🎨 Theme</div>
        <ThemeSwitcher/>
      </div>


      {/* User mini */}
      <div style={{marginTop:"auto",paddingTop:16,borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px"}}>
          <div style={{
            width:32,height:32,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:14,color:theme.bg,fontWeight:700,
            boxShadow:`0 0 14px ${theme.accentGlow}`,
          }}>S</div>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>sakura_beats</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>
              #{fmt(MOCK_PLAYER.globalRank)}
              
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ══════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════ */
const Topbar = ({ title, onMenu, onLogout }) => {
  const { t } = useLang();
  return (
    <div style={{
      height:58,borderBottom:"1px solid var(--border)",
      background:"rgba(7,11,20,0.85)",backdropFilter:"blur(12px)",
      display:"flex",alignItems:"center",padding:"0 24px",gap:14,
      position:"sticky",top:0,zIndex:100,
    }}>
      <button onClick={onMenu} className="btn-ghost" style={{
        display:"none",padding:"6px 10px",fontSize:16,borderRadius:8,
      }} id="mobile-menu-btn">☰</button>
      <h1 className="syne" style={{fontSize:16,fontWeight:700}}>{title}</h1>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
        <ThemeSwitcher/>
        <LangToggle/>
        <div style={{
          display:"flex",alignItems:"center",gap:8,
          background:"var(--card2)",border:"1px solid var(--border)",
          borderRadius:20,padding:"5px 12px",cursor:"pointer",
        }} onClick={onLogout}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px rgba(74,222,128,0.6)"}}/>
          <span style={{fontSize:12,color:"var(--muted)",fontWeight:500}}>sakura_beats</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STAT CARD (reusable)
══════════════════════════════════════════ */
const StatCard = ({ icon, label, value, color, delay=0, sub }) => (
  <div className={`card fu d${delay}`} style={{padding:"18px 20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,right:0,width:60,height:60,
      borderRadius:"50%",background:`${color}12`,transform:"translate(20px,-20px)"}}/>
    <div style={{fontSize:18,color,marginBottom:8}}>{icon}</div>
    <div className="mono" style={{fontSize:20,fontWeight:700,color,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{sub}</div>}
    <div style={{fontSize:11,color:"var(--muted)",marginTop:4,letterSpacing:0.4}}>{label}</div>
  </div>
);

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
const Dashboard = () => {
  const { t, lang } = useLang();
  const dt = t.dash;
  const p = MOCK_PLAYER;
  const skills = computeSkills(p);
  const ppTrend = computePPTrend(p);
  const recommended = recommendMaps(p, RECOMMENDED_MAPS);
  const [addedQ, setAddedQ] = useState({});
  const [filter, setFilter] = useState(0);
  
  const filterLabels = dt.filters;
  const tierMap = [null,"Farm","Challenge","Hard"];
  
  const getTier = (pp) => {
    const d = pp - p.topPlay.pp;
    if(d>50)  return {i:3,label:dt.filters[3],c:"#f87171",bg:"rgba(248,113,113,0.12)"};
    if(d>0)   return {i:2,label:dt.filters[2],c:"var(--amber)",bg:"var(--amberDim)"};
    if(d>-80) return {i:1,label:dt.filters[1],c:"#68d891",bg:"rgba(104,216,145,0.12)"};
    return         {i:0,label:dt.filters[0],c:"#7eb8f7",bg:"rgba(126,184,247,0.12)"};
  };

  const filtered = filter===0 ? recommended : recommended.filter(m=>getTier(m.pp).i===filter);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {/* Hero card */}
      <div className="card fu" style={{
        padding:"28px 32px",position:"relative",overflow:"hidden",
        background:"linear-gradient(135deg,var(--card) 0%,var(--card2) 100%)",
      }}>
        <div style={{position:"absolute",right:-60,top:-60,width:300,height:300,
          borderRadius:"50%",background:"radial-gradient(circle,var(--glow) 0%,transparent 65%)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:22,flexWrap:"wrap"}}>
          <div style={{
            width:72,height:72,borderRadius:20,flexShrink:0,
            background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:30,color:"var(--bg)",boxShadow:"0 0 30px var(--glow)",
            fontWeight:700,
          }}>S</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
              <h2 className="syne" style={{fontSize:24,fontWeight:800}}>
                {dt.welcome} <span className="accent-text">{p.username}</span>
              </h2>
              <span style={{fontSize:18}}>{p.countryFlag}</span>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {p.badges.map(b=><span key={b} className="tag">{b}</span>)}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="mono" style={{fontSize:38,fontWeight:700,color:"var(--a)",lineHeight:1}}>{fmt(Math.round(p.pp))}</div>
            <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Performance Points</div>
          </div>
        </div>
        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12,marginTop:24}}>
          {[
            {l:lang==="ru"?"Глоб. рейтинг":"Global Rank",v:`#${fmt(p.globalRank)}`,icon:"🌍",c:"var(--a)"},
            {l:lang==="ru"?"Рейтинг страны":"Country Rank",v:`#${fmt(p.countryRank)}`,icon:"🏆",c:"var(--amber)"},
            {l:lang==="ru"?"Точность":"Accuracy",v:`${p.accuracy}%`,icon:"◎",c:"#68d891"},
            {l:lang==="ru"?"Игр":"Play Count",v:fmt(p.playCount),icon:"▶",c:"#7eb8f7"},
            {l:lang==="ru"?"Время":"Play Time",v:p.playTime,icon:"⏱",c:"#c084fc"},
            {l:lang==="ru"?"Макс. комбо":"Max Combo",v:`${fmt(p.maxCombo)}x`,icon:"🔥",c:"#f87171"},
          ].map((s,i)=>(
            <div key={i} style={{
              background:"var(--bg2)",borderRadius:12,padding:"12px 14px",
              border:"1px solid var(--border)",
            }}>
              <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
              <div className="mono" style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2,letterSpacing:0.3}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div className="card fu d2" style={{padding:22}}>
          <div style={{fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:14}}>
            <span className="accent-text">◈</span> {dt.ppProgress}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={ppTrend}>
              <defs>
                <linearGradient id="ppG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--a)" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="var(--a)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={["auto","auto"]} tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false} width={42}/>
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}/>
              <Area type="monotone" dataKey="pp" stroke="var(--a)" strokeWidth={2} fill="url(#ppG)" dot={{fill:"var(--a2)",r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card fu d3" style={{padding:22}}>
          <div style={{fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:14}}>
            <span className="accent-text">◉</span> {dt.skillRadar}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={skills}>
              <PolarGrid stroke="var(--border)"/>
              <PolarAngleAxis dataKey={lang==="ru"?"skillRu":"skill"} tick={{fill:"var(--muted)",fontSize:11}}/>
              <Radar dataKey="value" stroke="var(--a)" fill="var(--dim)" strokeWidth={2}/>
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grades + Recent */}
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:18}}>
        <div className="card fu d3" style={{padding:22,minWidth:190}}>
          <div style={{fontWeight:700,marginBottom:18,fontSize:14}}>
            <span className="accent-text">★</span> {dt.grades}
          </div>
          {Object.entries(p.grades).map(([g,cnt])=>(
            <div key={g} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span className={`rank-badge rank-${g}`}>{g}</span>
              <div className="pb-wrap" style={{flex:1}}>
                <div className="pb" style={{width:`${Math.min(100,cnt/7)}%`}}/>
              </div>
              <span className="mono" style={{fontSize:12,minWidth:28,textAlign:"right"}}>{cnt}</span>
            </div>
          ))}
        </div>
        <div className="card fu d4" style={{padding:22}}>
          <div style={{fontWeight:700,marginBottom:14,fontSize:14}}>
            <span className="accent-text">▶</span> {dt.recentPlays}
          </div>
          {p.recentActivity.map((r,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:12,padding:"9px 0",
              borderBottom:i<p.recentActivity.length-1?"1px solid var(--border)":"none",
            }}>
              <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.map}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{r.diff} · {r.acc}%</div>
              </div>
              <div style={{textAlign:"right"}}>
                {r.pp>0&&<div className="mono" style={{fontWeight:700,color:"var(--a)",fontSize:13}}>{r.pp}pp</div>}
                <div style={{fontSize:11,color:"var(--muted)"}}>{r.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Recommendations */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{
              width:36,height:36,borderRadius:12,background:"var(--grad)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,color:"var(--bg)",boxShadow:"0 4px 14px var(--glow)",
            }}>♪</div>
            <div>
              <h3 className="syne" style={{fontSize:15,fontWeight:700}}>{dt.mapsForYou}</h3>
              <p style={{fontSize:11,color:"var(--muted)"}}>{dt.basedOn} <span style={{color:"var(--a)",fontWeight:700}}>{p.topPlay.pp}pp</span></p>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {filterLabels.map((f,i)=>(
              <button key={f} onClick={()=>setFilter(i)} style={{
                padding:"4px 12px",borderRadius:20,border:"1px solid",
                borderColor:filter===i?"var(--a)":"var(--border)",
                background:filter===i?"var(--a)":"var(--card2)",
                color:filter===i?"var(--bg)":"var(--muted)",
                cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all 0.2s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}} className="">
          {filtered.map((m,i)=>{
            const tier=getTier(m.pp);
            const isAdded=!!addedQ[m.id];
            const d=m.ppDiff>=0?`+${m.ppDiff.toFixed(0)}`:m.ppDiff.toFixed(0);
            return (
              <div key={m.id} className="card map-card fu" style={{
                animationDelay:`${i*0.04}s`,overflow:"hidden",display:"flex",flexDirection:"column",
                cursor:"pointer",
              }} onClick={()=>window.open(`https://osu.ppy.sh/beatmapsets/${m.beatmapSetId}`,"_blank")}>
                <div style={{
                  height:68,background:`linear-gradient(135deg,${tier.bg},var(--bg2))`,
                  borderBottom:"1px solid var(--border)",position:"relative",overflow:"hidden",
                  display:"flex",alignItems:"center",padding:"0 14px",
                }}>
                  <span style={{fontSize:24,marginRight:10,opacity:0.8}}>♪</span>
                  <div>
                    <div style={{fontSize:10,color:tier.c,fontWeight:700}}>{tier.label}</div>
                    <div className="mono" style={{fontSize:11,color:tier.c}}>{d}pp vs best</div>
                  </div>
                  {m.matchesWeak&&<span style={{position:"absolute",top:6,right:8,fontSize:9,
                    background:"var(--amber)20",color:"var(--amber)",border:"1px solid var(--amber)30",
                    borderRadius:10,padding:"2px 5px",fontWeight:700}}>
                    {lang==="ru"?"слабость":"weakness"} ↑
                  </span>}
                  {/* osu! link indicator */}
                  <span style={{position:"absolute",bottom:6,right:8,fontSize:9,color:"var(--muted)",opacity:0.7}}>osu! ↗</span>
                </div>
                <div style={{padding:"10px 12px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                  <div style={{fontSize:10,color:"var(--muted)"}}>{m.artist}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span className="mono" style={{fontSize:17,fontWeight:700,color:"var(--a)"}}>{m.pp}<span style={{fontSize:10,color:"var(--muted)"}}>pp</span></span>
                    <Stars v={m.stars}/>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {[`AR ${m.ar}`,`BPM ${m.bpm}`,m.length].map(tag=>(
                      <span key={tag} className="tag" style={{fontSize:10}}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={()=>setAddedQ(p=>({...p,[m.id]:!p[m.id]}))}
                    style={{
                      marginTop:"auto",width:"100%",padding:"6px",borderRadius:8,border:"1px solid",
                      borderColor:isAdded?"rgba(104,216,145,0.4)":"var(--border)",
                      background:isAdded?"rgba(104,216,145,0.12)":"var(--grad)",
                      color:isAdded?"#68d891":"var(--bg)",
                      cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all 0.2s",
                    }}>{isAdded?dt.added:dt.addQueue}</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{textAlign:"center",fontSize:12,color:"var(--muted)",paddingTop:8,borderTop:"1px solid var(--border)"}}>
          <span style={{color:"var(--a)",cursor:"pointer",fontWeight:600}}>{dt.viewAll}</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
const Profile = () => {
  const { t, lang } = useLang();
  const pt = t.profile;
  const p = MOCK_PLAYER;
  const skills = computeSkills(p);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({username:p.username,country:p.country});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="card fu" style={{padding:32,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,var(--dim) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <div style={{
              width:90,height:90,borderRadius:24,
              background:"var(--grad)",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:36,color:"var(--bg)",fontWeight:700,
              boxShadow:`0 0 40px var(--glow)`,
            }}>S</div>
            <button className="btn-accent" style={{padding:"6px 16px",fontSize:12,borderRadius:8}} onClick={()=>setEditing(!editing)}>
              {editing?pt.cancel:pt.edit}
            </button>
          </div>
          <div style={{flex:1,minWidth:200}}>
            {editing ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[["Username",form.username,"username",280],["Country",form.country,"country",80]].map(([lbl,val,key,w])=>(
                  <div key={key}>
                    <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:4}}>{lbl}</label>
                    <input value={val} onChange={e=>setForm({...form,[key]:e.target.value})} style={{padding:"8px 12px",width:w}}/>
                  </div>
                ))}
                <button className="btn-accent" style={{padding:"8px 20px",fontSize:13,width:"fit-content",borderRadius:8}} onClick={()=>setEditing(false)}>
                  {pt.save}
                </button>
              </div>
            ):(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                  <h2 className="syne" style={{fontSize:24,fontWeight:800}}>{form.username}</h2>
                  <span style={{fontSize:22}}>{p.countryFlag}</span>
                </div>
                <div style={{color:"var(--muted)",fontSize:13,marginBottom:12}}>{pt.since} {p.joined}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {p.badges.map(b=><span key={b} className="tag">{b}</span>)}
                </div>
              </>
            )}
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[
              {l:"Global",v:`#${fmt(p.globalRank)}`,c:"var(--a)"},
              {l:"Country",v:`#${fmt(p.countryRank)}`,c:"var(--amber)"},
            ].map(r=>(
              <div key={r.l} style={{background:"var(--bg2)",borderRadius:12,padding:"14px 18px",border:"1px solid var(--border)",textAlign:"center",minWidth:100}}>
                <div className="mono" style={{fontSize:20,fontWeight:700,color:r.c,marginTop:4}}>{r.v}</div>
                <div style={{fontSize:11,color:"var(--muted)",letterSpacing:0.5,marginTop:4}}>{r.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div className="card fu d1" style={{padding:22}}>
          <h3 className="syne" style={{fontWeight:700,marginBottom:18,color:"var(--a3)",fontSize:14}}>{pt.stats}</h3>
          {[
            [lang==="ru"?"Производительность":"Performance",`${fmt(Math.round(p.pp))} pp`],
            [lang==="ru"?"Точность":"Accuracy",`${p.accuracy}%`],
            [lang==="ru"?"Всего игр":"Total Play Count",fmt(p.playCount)],
            [lang==="ru"?"Время игры":"Play Time",p.playTime],
            [lang==="ru"?"Ранкед счёт":"Ranked Score",fmt(p.rankedScore)],
            [lang==="ru"?"Макс. комбо":"Max Combo",`${fmt(p.maxCombo)}x`],
            [lang==="ru"?"Уровень":"Level",`${p.level} (${p.levelProgress}%)`],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{color:"var(--muted)",fontSize:12}}>{k}</span>
              <span className="mono" style={{fontWeight:600,fontSize:13}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card fu d2" style={{padding:22}}>
            <h3 className="syne" style={{fontWeight:700,marginBottom:14,color:"var(--a3)",fontSize:14}}>{pt.topPlay}</h3>
            <div style={{background:"var(--bg2)",borderRadius:10,padding:14,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{p.topPlay.map}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}><Stars v={p.topPlay.stars}/></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="mono" style={{fontSize:22,fontWeight:700,color:"var(--a)"}}>{p.topPlay.pp}pp</div>
                  <span className="rank-badge rank-SS">SS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card fu d3" style={{padding:22}}>
            <h3 className="syne" style={{fontWeight:700,marginBottom:14,color:"var(--a3)",fontSize:14}}>{pt.level}</h3>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span className="mono" style={{fontSize:26,fontWeight:700,color:"var(--a)"}}>{p.level}</span>
              <span style={{color:"var(--muted)",fontSize:12,alignSelf:"center"}}>{p.levelProgress}% → {p.level+1}</span>
            </div>
            <div className="pb-wrap" style={{height:8}}>
              <div className="pb" style={{width:`${p.levelProgress}%`}}/>
            </div>
          </div>
          <div className="card fu d4" style={{padding:22}}>
            <h3 className="syne" style={{fontWeight:700,marginBottom:14,color:"var(--a3)",fontSize:14}}>{lang==="ru"?"Навыки":"Skills"}</h3>
            {skills.map(s=>(
              <div key={s.skill} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{width:72,fontSize:12,color:"var(--muted)"}}>{lang==="ru"?s.skillRu:s.skill}</div>
                <div className="pb-wrap" style={{flex:1}}>
                  <div className="pb" style={{width:`${s.value}%`}}/>
                </div>
                <span className="mono" style={{width:28,textAlign:"right",fontSize:12,fontWeight:600}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STATISTICS
══════════════════════════════════════════ */
const Statistics = () => {
  const { t, lang } = useLang();
  const st = t.stats;
  const p = MOCK_PLAYER;
  const skills = computeSkills(p);
  const sessData = [
    {day:"Mon",dayRu:"Пн",plays:45,pp:120},{day:"Tue",dayRu:"Вт",plays:32,pp:80},
    {day:"Wed",dayRu:"Ср",plays:67,pp:210},{day:"Thu",dayRu:"Чт",plays:23,pp:55},
    {day:"Fri",dayRu:"Пт",plays:89,pp:280},{day:"Sat",dayRu:"Сб",plays:102,pp:320},
    {day:"Sun",dayRu:"Вс",plays:78,pp:240},
  ].map(d=>({...d,date:lang==="ru"?d.dayRu:d.day}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 className="syne" style={{fontSize:22,fontWeight:800}}>{st.title}</h2>
        <span className="tag">{st.last7}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14}} className="fu d1">
        {[
          {l:"Total PP",v:fmt(Math.round(p.pp)),c:"var(--a)",icon:"◆",s:"performance"},
          {l:lang==="ru"?"Точность":"Accuracy",v:`${p.accuracy}%`,c:"#68d891",icon:"◎",s:"avg hit rate"},
          {l:lang==="ru"?"Время":"Play Time",v:p.playTime,c:"#7eb8f7",icon:"⏱",s:"total"},
          {l:lang==="ru"?"Ранкед":"Ranked Score",v:"2.84B",c:"var(--amber)",icon:"★",s:"ranked"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{padding:"18px 20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:k.c,fontSize:18}}>{k.icon}</span>
              <span style={{fontSize:10,color:"var(--muted)",letterSpacing:1}}>{k.s}</span>
            </div>
            <div className="mono" style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div className="card fu d2" style={{padding:22}}>
        <h3 style={{fontWeight:700,marginBottom:18,display:"flex",alignItems:"center",gap:8,fontSize:14}}>
          <span className="accent-text">◈</span> {st.rankHistory}
          <span style={{fontSize:12,color:"#68d891",marginLeft:"auto"}}>{st.improving}</span>
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={p.rankHistory}>
            <XAxis dataKey="date" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis reversed tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false} width={52}/>
            <Tooltip formatter={(v)=>`#${fmt(v)}`} contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}/>
            <Line type="monotone" dataKey="rank" stroke="var(--a)" strokeWidth={2.5} dot={{fill:"var(--a2)",r:4}} activeDot={{r:6,fill:"var(--a)"}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div className="card fu d3" style={{padding:22}}>
          <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">▶</span> {st.playsDay}</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={sessData} barSize={24}>
              <XAxis dataKey="date" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false} width={32}/>
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}/>
              <Bar dataKey="plays" fill="var(--a)" radius={[5,5,0,0]} opacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card fu d4" style={{padding:22}}>
          <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">◆</span> {st.ppDay}</h3>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={sessData}>
              <defs>
                <linearGradient id="ppDayG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="var(--amber)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false} width={32}/>
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}/>
              <Area type="monotone" dataKey="pp" stroke="var(--amber)" strokeWidth={2} fill="url(#ppDayG)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card fu d5" style={{padding:22}}>
        <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">◉</span> {st.skillBreak}</h3>
        {skills.map(s=>(
          <div key={s.skill} style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:88,fontSize:12,color:"var(--muted)"}}>{lang==="ru"?s.skillRu:s.skill}</div>
            <div className="pb-wrap" style={{flex:1}}>
              <div className="pb" style={{width:`${s.value}%`}}/>
            </div>
            <div className="mono" style={{width:30,fontSize:12,fontWeight:600,textAlign:"right"}}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAP CATALOG
══════════════════════════════════════════ */
const MapCatalog = () => {
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

/* ══════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════ */
const AdminPanel = () => {
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

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState("en");
  const [themeKey, setThemeKey] = useState("midnight");
  const [page, setPage] = useState("landing");
  const [loggedIn, setLoggedIn] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const theme = THEMES[themeKey];
  const t = { ...T[lang], lang };

  const titles = {
    dashboard: t.nav.dashboard, profile: t.nav.profile,
    stats: t.nav.stats, maps: t.nav.maps, admin: t.nav.admin,
  };

  const handleLogin = () => { setLoggedIn(true); setPage("dashboard"); };
  const handleLogout = () => { setLoggedIn(false); setPage("landing"); };

  if (!loggedIn) {
    return (
      <LangCtx.Provider value={{lang, t, setLang}}>
        <ThemeCtx.Provider value={{theme,themeKey,setTheme:k=>{setThemeKey(k)}}}>
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
    dashboard: <Dashboard/>,
    profile:   <Profile/>,
    stats:     <Statistics/>,
    maps:      <MapCatalog/>,
    admin:     <AdminPanel/>,
  };

  return (
    <LangCtx.Provider value={{lang, t, setLang}}>
      <ThemeCtx.Provider value={{theme,themeKey,setTheme:k=>setThemeKey(k)}}>
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
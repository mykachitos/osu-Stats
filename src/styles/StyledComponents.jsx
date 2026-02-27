import React from 'react';
export const GlobalStyle = ({ theme }) => (
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


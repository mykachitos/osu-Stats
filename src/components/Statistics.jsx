import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, 
  AreaChart, Area 
} from 'recharts';
import { useLang, useTheme, fmt } from '../App';
import { MOCK_PLAYER } from '../constants/mockData';
import { computeSkills } from '../utils/helpers';

const Statistics = ({ user }) => {
  const { t, lang } = useLang();
  const st = t.stats || {};
  
  // Приоритет: реальный юзер, если его нет - мок данные
  const p = user || MOCK_PLAYER;

  // Безопасный расчет скиллов
  const skills = (p && (p.statistics || p.params || p.recentActivity)) 
    ? computeSkills(p) 
    : [];

  // Данные для графиков активности (за последние 7 дней)
  const sessData = [
    {day:"Mon",dayRu:"Пн",plays:45,pp:120},{day:"Tue",dayRu:"Вт",plays:32,pp:80},
    {day:"Wed",dayRu:"Ср",plays:67,pp:210},{day:"Thu",dayRu:"Чт",plays:23,pp:55},
    {day:"Fri",dayRu:"Пт",plays:89,pp:280},{day:"Sat",dayRu:"Сб",plays:102,pp:320},
    {day:"Sun",dayRu:"Вс",plays:78,pp:240},
  ].map(d => ({
    ...d,
    date: lang === "ru" ? d.dayRu : d.day
  }));

  // Если данных совсем нет (даже мока), показываем заглушку
  if (!p) return <div className="card" style={{padding: 40, textAlign: 'center'}}>No data available</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Заголовок */}
      <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 className="syne" style={{fontSize:22,fontWeight:800}}>{st.title || 'Statistics'}</h2>
        <span className="tag" style={{background: 'var(--a2)', color: 'var(--a)'}}>{st.last7 || 'Last 7 Days'}</span>
      </div>

      {/* Сетка быстрых показателей */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14}} className="fu d1">
        {[
          {l:"Total PP", v:fmt(Math.round(p.pp || 0)), c:"var(--a)", icon:"◆", s:"performance"},
          {l:lang==="ru"?"Точность":"Accuracy", v:`${p.accuracy || 0}%`, c:"#68d891", icon:"◎", s:"avg hit rate"},
          {l:lang==="ru"?"Время":"Play Time", v:p.playTime || p.play_time || '0h', c:"#7eb8f7", icon:"⏱", s:"total"},
          {l:lang==="ru"?"Ранкед":"Ranked Score", v: p.rankedScore || "2.84B", c:"var(--amber)", icon:"★", s:"ranked"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{padding:"18px 20px", border: '1px solid var(--border)'}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:k.c,fontSize:18}}>{k.icon}</span>
              <span style={{fontSize:10,color:"var(--muted)",letterSpacing:1, textTransform: 'uppercase'}}>{k.s}</span>
            </div>
            <div className="mono" style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* График истории ранга */}
      <div className="card fu d2" style={{padding:22}}>
        <h3 style={{fontWeight:700,marginBottom:18,display:"flex",alignItems:"center",gap:8,fontSize:14}}>
          <span className="accent-text">◈</span> {st.rankHistory || 'Rank History'}
          <span style={{fontSize:12,color:"#68d891",marginLeft:"auto", fontWeight: 500}}>{st.improving || 'Improving'}</span>
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={p.rankHistory || []}>
            <XAxis 
                dataKey="date" 
                tick={{fill:"var(--muted)",fontSize:11}} 
                axisLine={false} 
                tickLine={false}
            />
            <YAxis 
                reversed 
                tick={{fill:"var(--muted)",fontSize:11}} 
                axisLine={false} 
                tickLine={false} 
                width={52}
                domain={['auto', 'auto']}
            />
            <Tooltip 
                formatter={(v)=>`#${fmt(v)}`} 
                contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)"}}
            />
            <Line 
                type="monotone" 
                dataKey="rank" 
                stroke="var(--a)" 
                strokeWidth={2.5} 
                dot={{fill:"var(--a2)",r:4}} 
                activeDot={{r:6,fill:"var(--a)"}}
                animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Нижние графики активности */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {/* Plays per Day */}
        <div className="card fu d3" style={{padding:22}}>
          <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">▶</span> {st.playsDay || 'Plays per Day'}</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={sessData} barSize={24}>
              <XAxis dataKey="date" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false} width={32}/>
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8}}/>
              <Bar dataKey="plays" fill="var(--a)" radius={[5,5,0,0]} opacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PP per Day */}
        <div className="card fu d4" style={{padding:22}}>
          <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">◆</span> {st.ppDay || 'PP Gain per Day'}</h3>
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
              <Tooltip contentStyle={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8}}/>
              <Area type="monotone" dataKey="pp" stroke="var(--amber)" strokeWidth={2} fill="url(#ppDayG)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Разбивка навыков */}
      <div className="card fu d5" style={{padding:22}}>
        <h3 style={{fontWeight:700,marginBottom:18,fontSize:14}}><span className="accent-text">◉</span> {st.skillBreak || 'Skill Breakdown'}</h3>
        {skills.length > 0 ? skills.map(s=>(
          <div key={s.skill} style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:88,fontSize:12,color:"var(--muted)"}}>{lang==="ru"?s.skillRu:s.skill}</div>
            <div className="pb-wrap" style={{flex:1, height: 8}}>
              <div className="pb" style={{width:`${s.value}%`, background: 'var(--grad)'}}/>
            </div>
            <div className="mono" style={{width:30,fontSize:12,fontWeight:600,textAlign:"right"}}>{s.value}</div>
          </div>
        )) : (
            <div style={{textAlign: 'center', color: 'var(--muted)', fontSize: 12}}>No skill data available</div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
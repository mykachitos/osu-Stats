import axios from 'axios';

let appToken = null;
let tokenExpiry = 0;

async function getAppToken() {
  const now = Date.now();
  if (appToken && now < tokenExpiry) return appToken;
  const res = await axios.post('https://osu.ppy.sh/oauth/token', {
    client_id: process.env.OSU_CLIENT_ID,
    client_secret: process.env.OSU_CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: 'public',
  });
  appToken = res.data.access_token;
  tokenExpiry = now + (res.data.expires_in - 60) * 1000;
  return appToken;
}

const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const percentile = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length * p)] || s[s.length - 1] || 0;
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const parseMods = mods => {
  if (!mods) return ['NM'];
  const r = [];
  if (mods & 8)    r.push('HD');
  if (mods & 16)   r.push('HR');
  if (mods & 64)   r.push('DT');
  if (mods & 512)  r.push('NC');
  if (mods & 2)    r.push('EZ');
  if (mods & 256)  r.push('HT');
  if (mods & 1024) r.push('FL');
  return r.length ? r : ['NM'];
};

const fmtSec = s => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

function computeSkillsFromScores(topScores) {
  if (!topScores.length) return null;

  const ars     = topScores.map(s => s.beatmap?.ar).filter(x => x != null);
  const bpms    = topScores.map(s => s.beatmap?.bpm || s.beatmapset?.bpm).filter(Boolean);
  const accs    = topScores.map(s => s.accuracy || 0);
  const lengths = topScores.map(s => s.beatmap?.hit_length || 0).filter(Boolean);
  const ods     = topScores.map(s => s.beatmap?.accuracy || 0).filter(Boolean);

  const avgAcc   = accs.reduce((s, x) => s + x, 0) / accs.length;
  const medAR    = median(ars);
  const medBPM   = median(bpms);
  const medLen   = median(lengths);

  // Aim: насколько высокий AR берём (7..10.3 → 0..100)
  const aimScore = clamp(Math.round(((medAR - 7) / (10.3 - 7)) * 100), 0, 100);

  // Speed: BPM + доля высокого BPM
  const highBpmRatio = bpms.filter(b => b >= 200).length / Math.max(bpms.length, 1);
  const speedScore = clamp(Math.round(highBpmRatio * 60 + (medBPM - 140) / 1.5), 0, 100);

  // Accuracy: средний accuracy
  const accScore = clamp(Math.round(avgAcc * 100), 0, 100);

  // Stamina: медиана длины и доля длинных карт (>180с)
  const longRatio = lengths.filter(l => l >= 180).length / Math.max(lengths.length, 1);
  const staminaScore = clamp(Math.round(longRatio * 70 + (medLen - 120) / 2.5), 0, 100);

  // Reading: accuracy на AR >= 9.5
  const hiArScores = topScores.filter(s => (s.beatmap?.ar || 0) >= 9.5);
  const readingAcc = hiArScores.length
    ? hiArScores.reduce((s, x) => s + (x.accuracy || 0), 0) / hiArScores.length
    : avgAcc - 0.01;
  const readingScore = clamp(Math.round(readingAcc * 100), 0, 100);

  // Tech: OD >= 9 доля + accuracy
  const hiOdRatio = ods.filter(o => o >= 9).length / Math.max(ods.length, 1);
  const techScore = clamp(Math.round(hiOdRatio * 70 + accScore * 0.3), 0, 100);

  return { aim: aimScore, speed: speedScore, accuracy: accScore, stamina: staminaScore, reading: readingScore, tech: techScore };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { userId, accessToken } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });

  try {
    const userTok = accessToken || await getAppToken();
    const headers = { Authorization: `Bearer ${userTok}`, Accept: 'application/json' };

    // ══════════════════════════════
    // 1. ПАРСИНГ топ-100 + последние 50
    // ══════════════════════════════
    const [topRes, recentRes] = await Promise.allSettled([
      axios.get(`https://osu.ppy.sh/api/v2/users/${userId}/scores/best`,
        { headers, params: { limit: 100, mode: 'osu' } }),
      axios.get(`https://osu.ppy.sh/api/v2/users/${userId}/scores/recent`,
        { headers, params: { limit: 50, mode: 'osu', include_fails: 0 } }),
    ]);

    const topScores    = topRes.status === 'fulfilled'    ? topRes.value.data    : [];
    const recentScores = recentRes.status === 'fulfilled' ? recentRes.value.data : [];
    const allScores    = [...topScores, ...recentScores];

    if (!allScores.length) {
      return res.status(200).json({ recommendations: [], profile: null, skills: null, reason: 'no_scores' });
    }

    // ══════════════════════════════
    // 2. ПРОФИЛЬ ИГРОКА
    // ══════════════════════════════
    const topStarsSorted = topScores.map(s => s.beatmap?.difficulty_rating).filter(Boolean).sort((a, b) => a - b);
    const ars   = allScores.map(s => s.beatmap?.ar).filter(x => x != null);
    const bpms  = allScores.map(s => s.beatmap?.bpm || s.beatmapset?.bpm).filter(Boolean);
    const topPP = topScores[0]?.pp || 0;

    const medStars = +median(topStarsSorted).toFixed(2);
    const q1Stars  = +percentile(topStarsSorted, 0.25).toFixed(2);
    const q3Stars  = +percentile(topStarsSorted, 0.75).toFixed(2);
    const medAR    = +median(ars).toFixed(1);
    const medBPM   = Math.round(median(bpms));

    const modFreq = {};
    allScores.flatMap(s => parseMods(s.mods)).forEach(m => modFreq[m] = (modFreq[m] || 0) + 1);
    const favMods = Object.entries(modFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m).filter(m => m !== 'NM');

    const mapperFreq = {};
    allScores.forEach(s => { const m = s.beatmapset?.creator; if (m) mapperFreq[m] = (mapperFreq[m] || 0) + 1; });
    const favMappers = Object.entries(mapperFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([m]) => m);

    const avgAcc = allScores.reduce((s, x) => s + (x.accuracy || 0), 0) / allScores.length;

    // Skill radar
    const skills = computeSkillsFromScores(topScores);

    // Слабые навыки — нижние 2
    const weakSkills = skills
      ? Object.entries(skills).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => k)
      : [];

    const profile = {
      topPP, medStars, q1Stars, q3Stars, medAR, medBPM, favMods, favMappers,
      weakReading:  weakSkills.includes('reading'),
      weakSpeed:    weakSkills.includes('speed'),
      weakAim:      weakSkills.includes('aim'),
      weakStamina:  weakSkills.includes('stamina'),
      avgAcc: +(avgAcc * 100).toFixed(2),
      totalScoresParsed: allScores.length,
    };

    // ══════════════════════════════
    // 3. ПОИСК КАРТ — много запросов для ~100 рекомендаций
    //
    // Стратегия 50/50:
    //   ПОХОЖИЕ (similar): ±0.3★ от медианы, разные сортировки
    //   GAP-FILLING: farm (+0.3..+0.7★), challenge (+0.7..+1.4★)
    //   WEAKNESS: по слабым навыкам из skill radar
    //   EXTRA: дополнительные пасы для объёма
    // ══════════════════════════════
    const appTok = await getAppToken();
    const sH = { Authorization: `Bearer ${appTok}`, Accept: 'application/json' };
    const playedIds = new Set(allScores.map(s => s.beatmapset?.id).filter(Boolean));

    // Определения поисковых запросов
    // label — для фильтров на фронте
    // reason — для отображения причины
    // weight — множитель скора
    // sort  — сортировка API
    // page  — можно задавать cursor для пагинации (пока просто limit 50)
    const searchDefs = [
      // ══ ПОХОЖИЕ ~50% ══
      { label:'similar',   reason:'similar',      starsMin:medStars-0.3, starsMax:medStars+0.3, sort:'plays_desc',      limit:50, weight:1.2 },
      { label:'similar',   reason:'similar',      starsMin:medStars-0.3, starsMax:medStars+0.3, sort:'favourites_desc', limit:50, weight:1.1 },
      { label:'similar',   reason:'similar',      starsMin:medStars-0.4, starsMax:medStars+0.4, sort:'ranked_desc',     limit:30, weight:0.9 },
      { label:'warmup',    reason:'comfort_zone', starsMin:q1Stars-0.4,  starsMax:q1Stars+0.5,  sort:'plays_desc',      limit:30, weight:0.8 },
      { label:'warmup',    reason:'comfort_zone', starsMin:q1Stars-0.3,  starsMax:q1Stars+0.4,  sort:'favourites_desc', limit:20, weight:0.8 },

      // ══ GAP-FILLING ~50% ══
      { label:'farm',      reason:'farm_zone',    starsMin:medStars+0.3, starsMax:medStars+0.7, sort:'plays_desc',      limit:50, weight:1.1 },
      { label:'farm',      reason:'farm_zone',    starsMin:medStars+0.3, starsMax:medStars+0.7, sort:'favourites_desc', limit:30, weight:1.0 },
      { label:'challenge', reason:'gap_filling',  starsMin:medStars+0.7, starsMax:medStars+1.4, sort:'plays_desc',      limit:50, weight:0.9 },
      { label:'challenge', reason:'gap_filling',  starsMin:medStars+0.6, starsMax:medStars+1.3, sort:'ranked_desc',     limit:30, weight:0.85 },

      // ══ WEAKNESS TARGETING ══
      ...(weakSkills.includes('reading') ? [
        { label:'reading', reason:'reading_weakness', starsMin:q1Stars,      starsMax:q3Stars+0.5,  sort:'plays_desc',      limit:30, weight:1.0 },
        { label:'reading', reason:'reading_weakness', starsMin:medStars-0.2, starsMax:medStars+0.6, sort:'favourites_desc', limit:20, weight:0.9 },
      ] : []),
      ...(weakSkills.includes('speed') ? [
        { label:'speed',   reason:'speed_weakness',   starsMin:q1Stars,      starsMax:q3Stars+0.3,  sort:'plays_desc',      limit:30, weight:1.0 },
        { label:'speed',   reason:'speed_weakness',   starsMin:medStars-0.2, starsMax:medStars+0.5, sort:'ranked_desc',     limit:20, weight:0.9 },
      ] : []),
      ...(weakSkills.includes('aim') ? [
        { label:'aim',     reason:'aim_weakness',     starsMin:medStars-0.2, starsMax:medStars+0.5, sort:'plays_desc',      limit:25, weight:0.9 },
      ] : []),
      ...(weakSkills.includes('stamina') ? [
        { label:'stamina', reason:'stamina_weakness', starsMin:q1Stars,      starsMax:q3Stars,      sort:'plays_desc',      limit:25, weight:0.9 },
      ] : []),
    ];

    // Запускаем ВСЕ запросы параллельно
    const results = await Promise.allSettled(
      searchDefs.map(def =>
        axios.get('https://osu.ppy.sh/api/v2/beatmapsets/search', {
          headers: sH,
          params: { s: 'ranked', sort: def.sort, limit: def.limit },
        }).then(r => ({ beatmapsets: r.data.beatmapsets || [], def }))
      )
    );

    // ══════════════════════════════
    // 4. СКОРИНГ
    // ══════════════════════════════
    const scored = [];
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { beatmapsets, def } = result.value;

      for (const bs of beatmapsets) {
        if (playedIds.has(bs.id)) continue;
        const diff = bs.beatmaps?.[0];
        if (!diff) continue;

        const mapStars = diff.difficulty_rating;
        if (mapStars < def.starsMin || mapStars > def.starsMax) continue;

        let score = 40;

        // Близость AR (макс +20)
        const arDiff = Math.abs((diff.ar || 9) - medAR);
        score += Math.max(0, 20 - arDiff * 12);

        // Близость BPM (макс +15)
        const bpmDiff = Math.abs((bs.bpm || 160) - medBPM);
        score += Math.max(0, 15 - bpmDiff / 8);

        // Популярность (макс +15)
        score += Math.min(15, Math.log10(bs.play_count || 1) * 3);

        // Любимый маппер (+12)
        if (favMappers.includes(bs.creator)) score += 12;

        // Штраф за слишком большой разрыв (>2★)
        if (mapStars > medStars + 2) score -= 25;

        // Вес категории
        score = Math.round(score * (def.weight || 1));

        scored.push({
          id: bs.id,
          beatmapSetId: bs.id,
          title: bs.title,
          artist: bs.artist,
          mapper: bs.creator,
          diff: diff.version,
          stars: +mapStars.toFixed(2),
          bpm: bs.bpm,
          ar: diff.ar,
          od: diff.accuracy,
          cs: diff.cs,
          length: fmtSec(diff.hit_length),
          cover: bs.covers?.cover || bs.covers?.['list@2x'] || null,
          status: bs.status,
          play_count: bs.play_count,
          favourite_count: bs.favourite_count,
          _score: clamp(score, 0, 100),
          _reason: def.reason,
          _label: def.label,
          _starsAboveProfile: +(mapStars - medStars).toFixed(2),
        });
      }
    }

    // Дедупликация + сортировка + обрезка до 100
    const seen = new Set();
    const recommendations = scored
      .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
      .sort((a, b) => b._score - a._score)
      .slice(0, 100);

    return res.status(200).json({ recommendations, profile, skills });

  } catch (error) {
    console.error('Recommendations error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
}
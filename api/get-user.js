import axios from 'axios';

export const SESSION_VERSION = 2;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;

  // ИСПРАВЛЕНО: убрали лимит code.length > 512 — osu! коды бывают разной длины
  // Просто проверяем что код есть и является строкой
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ message: 'Invalid or missing code' });
  }

  const redirectUri = process.env.REDIRECT_URI || 'https://osu-stats-five.vercel.app/';

  try {
    // ── 1. code → access_token ──────────────────────────────────────────
    let accessToken;
    try {
      const tokenResponse = await axios.post('https://osu.ppy.sh/oauth/token', {
        client_id:     process.env.OSU_CLIENT_ID,
        client_secret: process.env.OSU_CLIENT_SECRET,
        code:          code.trim(),
        grant_type:    'authorization_code',
        redirect_uri:  redirectUri,
      });
      accessToken = tokenResponse.data.access_token;
    } catch (tokenErr) {
      const detail = tokenErr.response?.data ?? tokenErr.message;
      console.error('[get-user] TOKEN ERROR:', JSON.stringify(detail));
      return res.status(401).json({
        message: 'OAuth token exchange failed',
        detail,
      });
    }

    const headers = {
      Authorization:  `Bearer ${accessToken}`,
      Accept:         'application/json',
      'Content-Type': 'application/json',
    };

    // ── 2. Профиль ───────────────────────────────────────────────────────
    const meRes = await axios.get('https://osu.ppy.sh/api/v2/me', { headers });
    const u = meRes.data;
    const s = u.statistics || {};

    // ── 3. Параллельно: топ и последние игры ────────────────────────────
    const [recentRes, bestRes] = await Promise.all([
      axios.get(`https://osu.ppy.sh/api/v2/users/${u.id}/scores/recent`, {
        headers,
        params: { limit: 10, include_fails: 1 },
      }).catch(e => { console.error('[recent]', e.message); return { data: [] }; }),
      axios.get(`https://osu.ppy.sh/api/v2/users/${u.id}/scores/best`, {
        headers,
        params: { limit: 10 },
      }).catch(e => { console.error('[best]', e.message); return { data: [] }; }),
    ]);

    // ── Grades ───────────────────────────────────────────────────────────
    const gc = s.grade_counts || {};
    const grades = {
      SSH: gc.ssh ?? 0,
      SS:  gc.ss  ?? 0,
      SH:  gc.sh  ?? 0,
      S:   gc.s   ?? 0,
      A:   gc.a   ?? 0,
    };

    // ── Play time ────────────────────────────────────────────────────────
    const playTimeSec = s.play_time ?? 0;
    const playTimeH   = Math.round(playTimeSec / 3600);
    const play_time   = playTimeH >= 1 ? `${playTimeH.toLocaleString('en')}h` : '<1h';

    // ── Ranks ────────────────────────────────────────────────────────────
    const global_rank  = s.global_rank  ?? s.rank?.global  ?? 0;
    const country_rank = s.country_rank ?? s.rank?.country ?? 0;

    // ── Max combo ────────────────────────────────────────────────────────
    const max_combo = s.maximum_combo ?? s.max_combo ?? 0;

    // ── Recent activity ──────────────────────────────────────────────────
    const recentRaw = (recentRes.data?.length > 0)
      ? recentRes.data
      : (bestRes.data || []);

    const mapScore = sc => ({
      map:   sc.beatmapset?.title                    || 'Unknown',
      diff:  sc.beatmap?.version                     || '',
      pp:    Math.round(sc.pp                        || 0),
      acc:   +((sc.accuracy || 0) * 100).toFixed(1),
      rank:  sc.rank                                 || 'F',
      stars: +((sc.beatmap?.difficulty_rating || 0).toFixed(2)),
      date:  relativeDate(sc.ended_at || sc.created_at),
    });
    const recentActivity = recentRaw.slice(0, 10).map(mapScore);

    // ── Top play ─────────────────────────────────────────────────────────
    const best0 = (bestRes.data || [])[0];
    const topPlay = best0 ? {
      map:   best0.beatmapset?.title || 'Unknown',
      pp:    Math.round(best0.pp     || 0),
      stars: +((best0.beatmap?.difficulty_rating || 0).toFixed(2)),
    } : null;

    // ── PP history ────────────────────────────────────────────────────────
    const ppHistory = buildPPHistory(bestRes.data || []);

    // ── Rank history ─────────────────────────────────────────────────────
    const rawRH = u.rank_history?.data || [];
    const rankHistory = sampleArray(rawRH, 7).map((rank, i) => ({
      date: monthLabel(i),
      rank,
    }));

    // ── Level ────────────────────────────────────────────────────────────
    const level          = s.level?.current  ?? 0;
    const level_progress = s.level?.progress ?? 0;

    // ── Response ─────────────────────────────────────────────────────────
    return res.status(200).json({
      _v: SESSION_VERSION,

      id:           u.id,
      username:     u.username,
      avatar_url:   u.avatar_url,
      country_code: u.country_code,

      global_rank,
      country_rank,

      pp:           +(s.pp           || 0).toFixed(2),
      accuracy:     +(s.hit_accuracy || 0).toFixed(2),
      play_count:   s.play_count      || 0,
      play_time,
      max_combo,
      ranked_score: s.ranked_score    || 0,

      level,
      level_progress,

      grades,
      topPlay,
      ppHistory,
      rankHistory,
      recentActivity,

      joined: u.join_date
        ? new Date(u.join_date).getFullYear().toString()
        : '',
      badges: (u.badges || []).map(b => b.description || 'Badge'),
    });

  } catch (err) {
    console.error('[get-user] FATAL:', err.response?.data ?? err.message);
    return res.status(500).json({ message: 'Authentication failed', error: err.message });
  }
}

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function relativeDate(iso) {
  if (!iso) return '';
  const h = Math.floor((Date.now() - new Date(iso)) / 3_600_000);
  if (h < 1)  return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildPPHistory(scores) {
  if (!scores.length) return [];
  return [...scores]
    .sort((a, b) => new Date(a.ended_at || a.created_at) - new Date(b.ended_at || b.created_at))
    .slice(-7)
    .map(sc => ({
      date: new Date(sc.ended_at || sc.created_at).toLocaleString('en', { month: 'short' }),
      pp:   Math.round(sc.pp || 0),
    }));
}

function sampleArray(arr, n) {
  if (!arr.length) return [];
  if (arr.length <= n) return arr;
  const step = Math.floor(arr.length / n);
  return Array.from({ length: n }, (_, i) => arr[i * step]);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function monthLabel(i) {
  const d = new Date();
  d.setMonth(d.getMonth() - (6 - i));
  return MONTHS[d.getMonth()];
}

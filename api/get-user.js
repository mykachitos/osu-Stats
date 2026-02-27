import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    // 1. Получаем токен
    const tokenResponse = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI,
    });

    const accessToken = tokenResponse.data.access_token;
    const authHeader = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    // 2. Параллельные запросы
    const [userRes, recentRes, bestRes] = await Promise.all([
      axios.get('https://osu.ppy.sh/api/v2/me/osu', { headers: authHeader }),
      axios.get('https://osu.ppy.sh/api/v2/users/me/scores/recent?mode=osu&limit=10&include_fails=1', { headers: authHeader }),
      axios.get('https://osu.ppy.sh/api/v2/users/me/scores/best?mode=osu&limit=50', { headers: authHeader }),
    ]);

    const userData = userRes.data;
    const stats = userData.statistics || {};
    const gradeCounts = stats.grade_counts || {};

    // 3. topPlay — первый лучший скор
    const topPlayRaw = bestRes.data[0] || null;
    const topPlay = topPlayRaw ? {
      pp: topPlayRaw.pp || 0,
      stars: topPlayRaw.beatmap?.difficulty_rating || 0,
      map: topPlayRaw.beatmapset?.title || 'Unknown',
    } : { pp: stats.pp || 0, stars: 0, map: '' };

    // 4. ppHistory — аппроксимация из rank_history (osu! не отдаёт историю pp)
    const rankHistoryRaw = userData.rank_history?.data || [];
    const currentPP = stats.pp || 0;
    const ppHistory = rankHistoryRaw.length > 0
      ? rankHistoryRaw
          .filter((_, i) => i % 10 === 0 || i === rankHistoryRaw.length - 1) // берём каждый 10й день
          .map((rank, i, arr) => ({
            date: `D${Math.round((i / arr.length) * 90)}`,
            pp: Math.round(currentPP * (0.78 + (i / arr.length) * 0.22)),
          }))
      : [{ date: 'Now', pp: Math.round(currentPP) }];

    // 5. grades — ЗАГЛАВНЫЕ ключи для Dashboard
    const grades = {
      SSH: gradeCounts.ssh || 0,
      SS:  gradeCounts.ss  || 0,
      SH:  gradeCounts.sh  || 0,
      S:   gradeCounts.s   || 0,
      A:   gradeCounts.a   || 0,
    };

    // 6. recentActivity — добавляем stars (нужно для computeSkills)
    const recentActivity = recentRes.data.map(s => ({
      map:   s.beatmapset?.title || 'Unknown',
      diff:  s.beatmap?.version || '',
      pp:    Math.round(s.pp || 0),
      acc:   (s.accuracy * 100).toFixed(2),
      rank:  s.rank,
      stars: s.beatmap?.difficulty_rating || 0,
      mods:  s.mods || [],
      date:  s.created_at,
    }));

    // 7. bestScores для будущей аналитики
    const bestScores = bestRes.data.map(s => ({
      pp:     s.pp || 0,
      acc:    (s.accuracy * 100).toFixed(2),
      stars:  s.beatmap?.difficulty_rating || 0,
      bpm:    s.beatmap?.bpm || 0,
      length: s.beatmap?.hit_length || 0,
      mods:   s.mods || [],
    }));

    // 8. Возвращаем полный объект
    return res.status(200).json({
      // Базовые поля osu!
      id:           userData.id,
      username:     userData.username,
      avatar_url:   userData.avatar_url || null,
      country_code: userData.country_code || '',
      badges:       (userData.badges || []).map(b => b.description || b),

      // Корневые поля для helpers.js
      pp:        currentPP,
      accuracy:  stats.hit_accuracy || 0,
      playCount: stats.play_count || 0,

      // statistics объект для Dashboard
      statistics: {
        pp:            currentPP,
        global_rank:   stats.global_rank || 0,
        country_rank:  stats.country_rank || 0,
        hit_accuracy:  stats.hit_accuracy || 0,
        play_count:    stats.play_count || 0,
        play_time:     stats.play_time || 0,
        maximum_combo: stats.maximum_combo || 0,
      },

      // Обработанные данные
      grades,
      topPlay,
      ppHistory,
      rankHistory: rankHistoryRaw
        .filter((_, i) => i % 10 === 0 || i === rankHistoryRaw.length - 1)
        .map((rank, i, arr) => ({
          date: `D${Math.round((i / arr.length) * 90)}`,
          rank,
        })),
      recentActivity,
      bestScores,
    });

  } catch (error) {
    console.error('osu! API Error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Auth failed',
      error: error.message,
      details: error.response?.data || null,
    });
  }
}

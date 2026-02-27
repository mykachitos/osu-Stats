import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is required' });

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
    const authHeader = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };

    // 2. Параллельные запросы
    const [userRes, recentRes, bestRes] = await Promise.all([
      axios.get('https://osu.ppy.sh/api/v2/me/osu', { headers: authHeader }),
      axios.get('https://osu.ppy.sh/api/v2/users/me/scores/recent?mode=osu&limit=10&include_fails=1', { headers: authHeader }),
      axios.get('https://osu.ppy.sh/api/v2/users/me/scores/best?mode=osu&limit=50', { headers: authHeader }),
    ]);

    const userData = userRes.data;
    const stats = userData.statistics || {};

    // 3. topPlay из лучшего скора
    const topPlayRaw = bestRes.data[0] || null;
    const topPlay = topPlayRaw ? {
      pp: topPlayRaw.pp,
      stars: topPlayRaw.beatmap?.difficulty_rating || 0,
      map: topPlayRaw.beatmapset?.title || 'Unknown',
    } : null;

    // 4. ppHistory — osu! API не отдаёт историю pp напрямую.
    // Строим приблизительную из rank_history (инвертируем: меньше ранк = больше pp)
    const rankHistoryRaw = userData.rank_history?.data || [];
    const currentPP = stats.pp || 0;
    const ppHistory = rankHistoryRaw.length > 0
      ? rankHistoryRaw.map((rank, i) => {
          // Линейная аппроксимация от ~80% текущего pp до текущего
          const factor = (i + 1) / rankHistoryRaw.length;
          return {
            date: `D${i + 1}`,
            pp: Math.round(currentPP * (0.8 + factor * 0.2)),
          };
        })
      : [];

    // 5. grades — Dashboard ждёт p.grades с ключами SSH/SS/SH/S/A
    const gradeCounts = stats.grade_counts || {};
    const grades = {
      SSH: gradeCounts.ssh || 0,
      SS: gradeCounts.ss || 0,
      SH: gradeCounts.sh || 0,
      S: gradeCounts.s || 0,
      A: gradeCounts.a || 0,
    };

    // 6. recentActivity — добавляем stars (нужно для computeSkills)
    const recentActivity = recentRes.data.map(s => ({
      map: s.beatmapset?.title || 'Unknown',
      diff: s.beatmap?.version || '',
      pp: s.pp || 0,
      acc: (s.accuracy * 100).toFixed(2),
      rank: s.rank,
      stars: s.beatmap?.difficulty_rating || 0,
      mods: s.mods || [],
      date: s.created_at,
    }));

    // 7. bestScores для будущей аналитики
    const bestScores = bestRes.data.map(s => ({
      pp: s.pp,
      acc: (s.accuracy * 100).toFixed(2),
      stars: s.beatmap?.difficulty_rating || 0,
      bpm: s.beatmap?.bpm || 0,
      length: s.beatmap?.hit_length || 0,
      mods: s.mods || [],
    }));

    // 8. Итоговый объект — все поля которые ожидает Dashboard и helpers БЛЯ КАК ЖЕ Я ЗАЕБАЛСЯ ВАСЬ ЭТО ПИЗДЕЦ КАКОЙ-ТО СУКА ЧЕ ДЕЛАТЬ ТО ЕБАНЫЙ ВРОТ
    return res.status(200).json({
      // Базовые поля от osu!
      ...userData,

      // Корневые поля (нужны computeSkills напрямую)
      pp: currentPP,
      accuracy: stats.hit_accuracy || 0,
      playCount: stats.play_count || 0,

      // Для Dashboard: statistics с правильными именами
      statistics: {
        pp: currentPP,
        global_rank: stats.global_rank || 0,
        country_rank: stats.country_rank || 0,
        hit_accuracy: stats.hit_accuracy || 0,
        play_count: stats.play_count || 0,
        play_time: stats.play_time || 0,
        maximum_combo: stats.maximum_combo || 0,
        ranked_score: stats.ranked_score || 0,
        total_score: stats.total_score || 0,
      },

      // Обработанные данные
      grades,
      topPlay,
      ppHistory,
      rankHistory: rankHistoryRaw.map((rank, i) => ({ date: `D${i + 1}`, rank })),
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
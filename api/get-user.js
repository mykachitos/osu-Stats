import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is required' });

  try {
    // 1. Токен (без изменений)
    const tokenResponse = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI,
    });

    const accessToken = tokenResponse.data.access_token;
    const authHeader = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };

    // 2. Запрашиваем данные параллельно (так быстрее)
    // Добавляем запрос на 'best' scores — это твои топ-100 плеи для анализа
    const [userRes, recentRes, bestRes] = await Promise.all([
      axios.get('https://osu.ppy.sh/api/v2/me/osu', { headers: authHeader }), // /osu в конце уточняет режим
      axios.get(`https://osu.ppy.sh/api/v2/users/me/scores/recent?mode=osu&limit=10`, { headers: authHeader }),
      axios.get(`https://osu.ppy.sh/api/v2/users/me/scores/best?mode=osu&limit=50`, { headers: authHeader })
    ]);

    const userData = userRes.data;

    // 3. Формируем расширенный объект
    return res.status(200).json({
      ...userData,
      // Сохраняем статистику в корень для удобства Dashboard
      global_rank: userData.statistics?.global_rank,
      country_rank: userData.statistics?.country_rank,
      
      // Данные для анализа недавней активности
      recentActivity: recentRes.data.map(s => ({
        map: s.beatmapset.title,
        diff: s.beatmap.version,
        pp: s.pp,
        acc: (s.accuracy * 100).toFixed(2),
        rank: s.rank,
        mods: s.mods,
        date: s.created_at
      })),

      // ДАННЫЕ ДЛЯ АНАЛИЗА (Топ плеи)
      // На основе этих 50 карт мы сможем понять, ты "фармила" или "техник"
      bestScores: bestRes.data.map(s => ({
        pp: s.pp,
        acc: (s.accuracy * 100).toFixed(2),
        stars: s.beatmap.difficulty_rating,
        bpm: s.beatmap.bpm,
        length: s.beatmap.hit_length,
        mods: s.mods
      })),

      // Дополнительно для графиков
      rankHistory: userData.rank_history?.data || []
    });

  } catch (error) {
    console.error('Osu! Deep Analytics Error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Auth failed', error: error.message });
  }
}
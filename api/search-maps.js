import axios from 'axios';

// Кешируем токен приложения (client_credentials grant)
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
  // expires_in в секундах, вычитаем 60с для запаса
  tokenExpiry = now + (res.data.expires_in - 60) * 1000;
  return appToken;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    q = '',
    s = 'ranked',       // статус: ranked, loved, qualified, any
    sort = 'plays_desc', // сортировка
    cursor_string,
    limit = 20,
  } = req.query;

  try {
    const token = await getAppToken();

    const params = {
      q: q || undefined,
      s: s !== 'any' ? s : undefined,
      sort,
      limit: Math.min(Number(limit), 50),
      cursor_string: cursor_string || undefined,
    };

    // Убираем undefined поля
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

    const response = await axios.get('https://osu.ppy.sh/api/v2/beatmapsets/search', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      params,
    });

    // Отдаём только нужные поля, не перегружая ответ
    const beatmapsets = (response.data.beatmapsets || []).map(bs => ({
      id: bs.id,
      title: bs.title,
      artist: bs.artist,
      creator: bs.creator,
      bpm: bs.bpm,
      status: bs.status,
      favourite_count: bs.favourite_count,
      play_count: bs.play_count,
      tags: bs.tags,
      covers: bs.covers,
      beatmaps: (bs.beatmaps || []).slice(0, 1).map(b => ({
        id: b.id,
        version: b.version,
        difficulty_rating: b.difficulty_rating,
        ar: b.ar,
        accuracy: b.accuracy,
        cs: b.cs,
        hit_length: b.hit_length,
        total_length: b.total_length,
      })),
    }));

    return res.status(200).json({
      beatmapsets,
      cursor_string: response.data.cursor_string || null,
      total: response.data.total,
    });

  } catch (error) {
    console.error('Map search error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to fetch maps',
      error: error.message,
    });
  }
}
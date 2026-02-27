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

    // 1. Обмениваем код (code) на токен доступа (access_token)

    const tokenResponse = await axios.post('https://osu.ppy.sh/oauth/token', {

      client_id: process.env.OSU_CLIENT_ID,

      client_secret: process.env.OSU_CLIENT_SECRET,

      code: code,

      grant_type: 'authorization_code',

      redirect_uri: process.env.REDIRECT_URI, // Например: https://your-site.vercel.app

    });


    const accessToken = tokenResponse.data.access_token;


    // 2. Получаем данные профиля игрока с помощью этого токена

    const userResponse = await axios.get('https://osu.ppy.sh/api/v2/me', {

      headers: {

        Authorization: `Bearer ${accessToken}`,

        Accept: 'application/json',

        'Content-Type': 'application/json',

      },

    });


    // 3. Возвращаем данные игрока на фронтенд

    // Здесь мы берем только нужные поля, чтобы не перегружать память

    const userData = userResponse.data;

    

    return res.status(200).json({

      id: userData.id,

      username: userData.username,

      avatar_url: userData.avatar_url,

      country_code: userData.country_code,

      global_rank: userData.statistics.global_rank,

      pp: userData.statistics.pp,

      accuracy: userData.statistics.hit_accuracy,

      play_count: userData.statistics.play_count,

      level: userData.statistics.level.current,

      // Добавьте любые другие поля из API osu! v2

    });


  } catch (error) {

    console.error('Osu! Auth Error:', error.response?.data || error.message);

    return res.status(500).json({ message: 'Authentication failed', error: error.message });

  }

} 

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); 

const CLIENT_ID = '49205';
const CLIENT_SECRET = 'QyMmDTVz9nHbFlzlrUDosQh9LM5u6inJFkLLdLxe'; // 

let accessToken = '';

async function refreshTokens() {
  const res = await axios.post('https://osu.ppy.sh/oauth/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: 'public'
  });
  accessToken = res.data.access_token;
}


app.get('/api/player/:username', async (req, res) => {
  try {
    if (!accessToken) await refreshTokens();
    
    const user = await axios.get(`https://osu.ppy.sh/api/v2/users/${req.params.username}/osu`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const scores = await axios.get(`https://osu.ppy.sh/api/v2/users/${user.data.id}/scores/best?limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Отправляем все данные на фронтенд
    res.json({ profile: user.data, topScores: scores.data });
  } catch (err) {
    res.status(500).json({ error: "Player not found" });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

async function refreshTokens() {
  try {
    const res = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'public'
    });
    accessToken = res.data.access_token;
    console.log("Token updated successfully!");
  } catch (err) {
    console.error("Ошибка обновления токена:", err.response?.data || err.message);
  }
}

pp.get('/api/player/:username', async (req, res) => {
  try {
    if (!accessToken) await refreshTokens();

    // Запрос профиля игрока
    const userRes = await axios.get(`https://osu.ppy.sh/api/v2/users/${req.params.username}/osu`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(userRes.data);
  } catch (error) {
    res.status(404).json({ error: "Игрок не найден" });
  }
});

app.listen(5000, () => console.log('Сервер запущен на http://localhost:5000'));
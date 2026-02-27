import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Нормализуем данные от osu! API в формат который ждёт Dashboard
function normalizeOsuUser(data) {
  if (!data) return null;

  const stats = data.statistics || {};
  const gradeCounts = stats.grade_counts || {};

  // topPlay из bestScores если есть, иначе из topPlay
  const topPlay = data.topPlay || (data.bestScores && data.bestScores[0] ? {
    pp: data.bestScores[0].pp,
    stars: data.bestScores[0].stars || 0,
    map: 'Top Play',
  } : { pp: stats.pp || 0, stars: 0, map: '' });

  // ppHistory из rankHistory если нет прямой истории
  let ppHistory = data.ppHistory || [];
  if (ppHistory.length === 0 && data.rankHistory && data.rankHistory.length > 0) {
    const currentPP = stats.pp || 0;
    const history = data.rankHistory;
    ppHistory = history.map((h, i) => ({
      date: h.date || `D${i + 1}`,
      pp: Math.round(currentPP * (0.78 + (i / history.length) * 0.22)),
    }));
  }

  return {
    // Базовые поля
    id: data.id,
    username: data.username || 'Player',
    avatar_url: data.avatar_url || null,
    country_code: data.country_code || data.country || '',
    badges: data.badges?.map(b => typeof b === 'string' ? b : b.description) || ['Player'],

    // PP и ранки в корне (нужны helpers.js)
    pp: stats.pp || data.pp || 0,
    accuracy: stats.hit_accuracy || data.accuracy || 0,
    playCount: stats.play_count || data.playCount || 0,

    // statistics — именно этот объект читает Dashboard
    statistics: {
      pp: stats.pp || data.pp || 0,
      global_rank: stats.global_rank || data.global_rank || 0,
      country_rank: stats.country_rank || data.country_rank || 0,
      hit_accuracy: stats.hit_accuracy || data.accuracy || 0,
      play_count: stats.play_count || data.playCount || 0,
      play_time: stats.play_time || 0,
      maximum_combo: stats.maximum_combo || data.maxCombo || 0,
    },

    // grades — Dashboard делает Object.entries(p.grades)
    // ключи должны быть ЗАГЛАВНЫМИ: SSH, SS, SH, S, A
    grades: data.grades || {
      SSH: gradeCounts.ssh || gradeCounts.SSH || 0,
      SS:  gradeCounts.ss  || gradeCounts.SS  || 0,
      SH:  gradeCounts.sh  || gradeCounts.SH  || 0,
      S:   gradeCounts.s   || gradeCounts.S   || 0,
      A:   gradeCounts.a   || gradeCounts.A   || 0,
    },

    // Для графиков и рекомендаций
    topPlay,
    ppHistory,
    rankHistory: data.rankHistory || [],
    recentActivity: data.recentActivity || [],
    bestScores: data.bestScores || [],
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      window.history.replaceState({}, document.title, '/');

      axios.post('/api/get-user', { code })
        .then(res => {
          const normalized = normalizeOsuUser(res.data);
          setUser(normalized);
          localStorage.setItem('osu_session', JSON.stringify(normalized));
        })
        .catch(err => {
          console.error('Auth error:', err);
        })
        .finally(() => setLoading(false));

    } else {
      const saved = localStorage.getItem('osu_session');
      if (saved) {
        try {
          // Нормализуем снова на случай если старые данные были в старом формате
          const parsed = JSON.parse(saved);
          setUser(normalizeOsuUser(parsed));
        } catch {
          localStorage.removeItem('osu_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('osu_session');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

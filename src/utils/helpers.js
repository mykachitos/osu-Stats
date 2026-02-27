export function computeSkills(player) {
  if (!player || !player.recentActivity || !Array.isArray(player.recentActivity)) {
    return [
      { skill: "Aim", skillRu: "Прицел", value: 20 },
      { skill: "Speed", skillRu: "Скорость", value: 20 },
      { skill: "Accuracy", skillRu: "Точность", value: 20 },
      { skill: "Stamina", skillRu: "Выносливость", value: 20 },
      { skill: "Reading", skillRu: "Чтение", value: 20 },
      { skill: "Tech", skillRu: "Техника", value: 20 },
    ];
  }

  const { recentActivity, topPlay } = player;
  // ФИКС: берём accuracy и pp из statistics если они там
  const accuracy = player.accuracy ?? player.statistics?.hit_accuracy ?? 90;
  const pp = player.pp ?? player.statistics?.pp ?? 0;
  const playCount = player.playCount ?? player.statistics?.play_count ?? 0;

  const recentAvgAcc = recentActivity.length > 0
    ? recentActivity.reduce((s, p) => s + parseFloat(p.acc || 0), 0) / recentActivity.length
    : 0;

  const recentAvgStars = recentActivity.length > 0
    ? recentActivity.reduce((s, p) => s + (p.stars || 0), 0) / recentActivity.length
    : 0;

  const highStarPlays = recentActivity.filter(p => (p.stars || 0) > 6).length;
  const hasHighBPM = recentActivity.some(p => p.diff?.includes("DIMENSIONS") || p.diff?.includes("Extra"));
  const ppFactor = Math.min(100, (pp / 100));

  const aim = Math.round(Math.min(99, 40 + ((topPlay?.stars || 0) / 10) * 40 + (recentAvgAcc - 90) * 1.5 + highStarPlays * 3));
  const speed = Math.round(Math.min(99, 35 + (hasHighBPM ? 15 : 0) + ppFactor * 0.4 + recentAvgStars * 5));
  const accScore = Math.round(Math.min(99, (recentAvgAcc - 88) * 5.5 + 20));
  const stamina = Math.round(Math.min(99, 30 + (playCount / 500) + (recentActivity.filter(p => parseFloat(p.acc) > 96).length * 6)));
  const reading = Math.round(Math.min(99, 40 + recentAvgStars * 6 + (accuracy - 90) * 1.2));
  const tech = Math.round(Math.min(99, 35 + (recentActivity.filter(p => p.diff?.includes("Technical") || p.diff?.includes("Extra")).length * 8)));

  return [
    { skill: "Aim", skillRu: "Прицел", value: Math.max(20, aim) },
    { skill: "Speed", skillRu: "Скорость", value: Math.max(20, speed) },
    { skill: "Accuracy", skillRu: "Точность", value: Math.max(20, accScore) },
    { skill: "Stamina", skillRu: "Выносливость", value: Math.max(20, stamina) },
    { skill: "Reading", skillRu: "Чтение", value: Math.max(20, reading) },
    { skill: "Tech", skillRu: "Техника", value: Math.max(20, tech) },
  ];
}

export function computePPTrend(player) {
  // ФИКС: пробуем ppHistory, если нет — строим из rankHistory
  if (player?.ppHistory && Array.isArray(player.ppHistory) && player.ppHistory.length > 0) {
    return player.ppHistory.map((h, i) => ({
      ...h,
      delta: i > 0 ? h.pp - player.ppHistory[i - 1].pp : 0,
    }));
  }

  // ФИКС: fallback — если есть rankHistory, отображаем инвертированный ранк
  if (player?.rankHistory && Array.isArray(player.rankHistory) && player.rankHistory.length > 0) {
    return player.rankHistory.map((h, i, arr) => ({
      date: h.date || `Day ${i + 1}`,
      pp: 100000 - (h.rank || h), // инвертируем ранк в "условный pp"
      delta: 0,
    }));
  }

  return [];
}

export function recommendMaps(player, maps) {
  // ФИКС: защита если topPlay нет
  const topPP = player?.topPlay?.pp ?? player?.statistics?.pp ?? player?.pp ?? 0;
  
  if (!maps || maps.length === 0) return [];

  const skills = computeSkills(player);
  const weakSkill = skills.slice().sort((a, b) => a.value - b.value)[0];

  return maps
    .map(m => {
      const ppDiff = m.pp - topPP;
      const matchesWeak = weakSkill
        ? m.tags.some(t => t.toLowerCase().includes(weakSkill.skill.toLowerCase().slice(0, 3)))
        : false;
      const farmScore = ppDiff > -100 && ppDiff < 80 ? 1 : 0;
      const score = farmScore + (matchesWeak ? 0.5 : 0) + (1 - Math.abs(ppDiff) / 500);
      return { ...m, score, ppDiff, matchesWeak };
    })
    .sort((a, b) => b.score - a.score);
}
return res.status(200).json({
  ...userData,

  // ФИКС: grades — osu! API отдаёт grade_counts, а не grades
  grades: userData.statistics?.grade_counts || {},

  // ФИКС: topPlay из лучшего скора
  topPlay: bestRes.data[0] ? {
    pp: bestRes.data[0].pp,
    stars: bestRes.data[0].beatmap?.difficulty_rating || 0,
    map: bestRes.data[0].beatmapset?.title || 'Unknown',
  } : null,

  // ФИКС: accuracy и playCount в корень (нужны computeSkills)
  accuracy: userData.statistics?.hit_accuracy || 0,
  playCount: userData.statistics?.play_count || 0,
  pp: userData.statistics?.pp || 0,

  recentActivity: recentRes.data.map(s => ({
    map: s.beatmapset?.title || 'Unknown',
    diff: s.beatmap?.version || '',
    pp: s.pp || 0,
    acc: (s.accuracy * 100).toFixed(2),
    rank: s.rank,
    stars: s.beatmap?.difficulty_rating || 0, // ФИКС: добавили stars для computeSkills
    mods: s.mods,
    date: s.created_at,
  })),

  bestScores: bestRes.data.map(s => ({
    pp: s.pp,
    acc: (s.accuracy * 100).toFixed(2),
    stars: s.beatmap?.difficulty_rating || 0,
    bpm: s.beatmap?.bpm || 0,
    length: s.beatmap?.hit_length || 0,
    mods: s.mods,
  })),

  // ФИКС: ppHistory из rankHistory для графика (API не отдаёт историю pp напрямую)
  rankHistory: userData.rank_history?.data || [],
  ppHistory: [], // osu! API не отдаёт историю pp, график будет пустым — это нормально
});

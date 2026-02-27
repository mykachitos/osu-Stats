import { RECOMMENDED_MAPS } from '../constants/mockData';

export function computeSkills(player) {
    // ЗАЩИТА: Если игрока нет или у него нет истории активности, возвращаем нули
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

    const { accuracy, pp, recentActivity, topPlay } = player;
    
    // Безопасный расчет средних значений
    const recentAvgAcc = recentActivity.length > 0 
        ? recentActivity.reduce((s, p) => s + (p.acc || 0), 0) / recentActivity.length 
        : 0;

    const recentAvgStars = recentActivity.length > 0 
        ? recentActivity.reduce((s, p) => s + (p.stars || 0), 0) / recentActivity.length 
        : 0;

    const highStarPlays = recentActivity.filter(p => (p.stars || 0) > 6).length;
    const hasHighBPM = recentActivity.some(p => p.diff?.includes("DIMENSIONS") || p.diff?.includes("Extra"));
    const ppFactor = Math.min(100, (pp / 100));

    // Старые формулы (добавил ?. на случай если topPlay нет)
    const aim = Math.round(Math.min(99, 40 + ((topPlay?.stars || 0) / 10) * 40 + (recentAvgAcc - 90) * 1.5 + highStarPlays * 3));
    const speed = Math.round(Math.min(99, 35 + (hasHighBPM ? 15 : 0) + ppFactor * 0.4 + recentAvgStars * 5));
    const accScore = Math.round(Math.min(99, (recentAvgAcc - 88) * 5.5 + 20));
    const stamina = Math.round(Math.min(99, 30 + (player.playCount / 500) + (recentActivity.filter(p => p.acc > 96).length * 6)));
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
    // ЗАЩИТА: Если нет истории PP, возвращаем пустой массив
    if (!player || !player.ppHistory || !Array.isArray(player.ppHistory)) {
        return [];
    }

    return player.ppHistory.map((h, i) => ({
        ...h,
        delta: i > 0 ? h.pp - player.ppHistory[i - 1].pp : 0,
    }));
}

export function recommendMaps(player, maps) {
  const topPP = player.topPlay.pp;
  const skills = computeSkills(player);
  const weakSkill = skills.slice().sort((a,b)=>a.value-b.value)[0];
  
  return maps
    .map(m => {
      const ppDiff = m.pp - topPP;
      const matchesWeak = m.tags.some(t=>t.toLowerCase().includes(weakSkill.skill.toLowerCase().slice(0,3)));
      const farmScore = ppDiff > -100 && ppDiff < 80 ? 1 : 0;
      const score = farmScore + (matchesWeak ? 0.5 : 0) + (1 - Math.abs(ppDiff)/500);
      return { ...m, score, ppDiff, matchesWeak };
    })
    .sort((a,b)=>b.score-a.score);
}
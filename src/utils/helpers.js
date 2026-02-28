import { RECOMMENDED_MAPS } from '../constants/mockData';

export function computeSkills(player) {
    // Если нет recentActivity — пробуем построить скиллы из других данных
    const hasRecent = player?.recentActivity && Array.isArray(player.recentActivity) && player.recentActivity.length > 0;

    if (!player) {
        return defaultSkills();
    }

    const { accuracy, pp, recentActivity, topPlay } = player;

    // Если recentActivity пустой — считаем скиллы только из pp/accuracy/topPlay
    if (!hasRecent) {
        const ppFactor = Math.min(99, (pp || 0) / 100);
        const accFactor = Math.min(99, ((accuracy || 0) - 88) * 5.5 + 20);
        const topStars = topPlay?.stars || 0;

        const aim      = Math.round(Math.min(99, Math.max(20, 40 + (topStars / 10) * 40 + (accFactor - 20) * 0.3)));
        const speed    = Math.round(Math.min(99, Math.max(20, 35 + ppFactor * 0.45)));
        const accScore = Math.round(Math.min(99, Math.max(20, accFactor)));
        const stamina  = Math.round(Math.min(99, Math.max(20, 30 + ((player.play_count || player.playCount || 0) / 500))));
        const reading  = Math.round(Math.min(99, Math.max(20, 40 + topStars * 6)));
        const tech     = Math.round(Math.min(99, Math.max(20, 35 + ppFactor * 0.3)));

        return [
            { skill: "Aim",      skillRu: "Прицел",        value: aim },
            { skill: "Speed",    skillRu: "Скорость",      value: speed },
            { skill: "Accuracy", skillRu: "Точность",      value: accScore },
            { skill: "Stamina",  skillRu: "Выносливость",  value: stamina },
            { skill: "Reading",  skillRu: "Чтение",        value: reading },
            { skill: "Tech",     skillRu: "Техника",       value: tech },
        ];
    }

    // Полный расчёт если есть recentActivity
    const recentAvgAcc = recentActivity.reduce((s, p) => s + (p.acc || 0), 0) / recentActivity.length;
    const recentAvgStars = recentActivity.reduce((s, p) => s + (p.stars || 0), 0) / recentActivity.length;
    const highStarPlays = recentActivity.filter(p => (p.stars || 0) > 6).length;
    const hasHighBPM = recentActivity.some(p => p.diff?.includes("DIMENSIONS") || p.diff?.includes("Extra"));
    const ppFactor = Math.min(100, ((pp || 0) / 100));

    const aim      = Math.round(Math.min(99, 40 + ((topPlay?.stars || 0) / 10) * 40 + (recentAvgAcc - 90) * 1.5 + highStarPlays * 3));
    const speed    = Math.round(Math.min(99, 35 + (hasHighBPM ? 15 : 0) + ppFactor * 0.4 + recentAvgStars * 5));
    const accScore = Math.round(Math.min(99, (recentAvgAcc - 88) * 5.5 + 20));
    const stamina  = Math.round(Math.min(99, 30 + ((player.play_count || player.playCount || 0) / 500) + (recentActivity.filter(p => p.acc > 96).length * 6)));
    const reading  = Math.round(Math.min(99, 40 + recentAvgStars * 6 + ((accuracy || 0) - 90) * 1.2));
    const tech     = Math.round(Math.min(99, 35 + (recentActivity.filter(p => p.diff?.includes("Technical") || p.diff?.includes("Extra")).length * 8)));

    return [
        { skill: "Aim",      skillRu: "Прицел",       value: Math.max(20, aim) },
        { skill: "Speed",    skillRu: "Скорость",      value: Math.max(20, speed) },
        { skill: "Accuracy", skillRu: "Точность",      value: Math.max(20, accScore) },
        { skill: "Stamina",  skillRu: "Выносливость",  value: Math.max(20, stamina) },
        { skill: "Reading",  skillRu: "Чтение",        value: Math.max(20, reading) },
        { skill: "Tech",     skillRu: "Техника",       value: Math.max(20, tech) },
    ];
}

function defaultSkills() {
    return [
        { skill: "Aim",      skillRu: "Прицел",       value: 20 },
        { skill: "Speed",    skillRu: "Скорость",      value: 20 },
        { skill: "Accuracy", skillRu: "Точность",      value: 20 },
        { skill: "Stamina",  skillRu: "Выносливость",  value: 20 },
        { skill: "Reading",  skillRu: "Чтение",        value: 20 },
        { skill: "Tech",     skillRu: "Техника",       value: 20 },
    ];
}

export function computePPTrend(player) {
    if (!player) return [];

    // Приоритет: ppHistory из API
    if (player.ppHistory && Array.isArray(player.ppHistory) && player.ppHistory.length > 0) {
        return player.ppHistory.map((h, i, arr) => ({
            date: h.date,
            pp:   h.pp,
            delta: i > 0 ? h.pp - arr[i - 1].pp : 0,
        }));
    }

    // Фолбэк: если нет ppHistory, строим из текущего pp заглушку
    if (player.pp) {
        const pp = player.pp;
        return [
            { date: 'Before', pp: Math.round(pp * 0.88), delta: 0 },
            { date: 'Month',  pp: Math.round(pp * 0.92), delta: 0 },
            { date: 'Now',    pp: Math.round(pp),        delta: 0 },
        ];
    }

    return [];
}

export function recommendMaps(player, maps) {
    const topPP = player?.topPlay?.pp || player?.pp || 0;
    if (!topPP) return maps.map(m => ({ ...m, score: 1, ppDiff: 0, matchesWeak: false }));

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
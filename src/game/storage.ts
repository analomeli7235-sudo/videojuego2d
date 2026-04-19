// Persistencia local del progreso (funciona offline y en Electron).
// Estructura por nivel: { completed, bestCoins, bestTime }
// Total acumulado de monedas se guarda aparte.

export type LevelProgress = {
  completed: boolean;
  bestCoins: number;
  bestTime: number; // segundos
};

export type SaveData = {
  totalCoins: number;
  levels: Record<number, LevelProgress>;
};

const KEY = "robo-runner-save-v1";

const empty = (): SaveData => ({
  totalCoins: 0,
  levels: {
    1: { completed: false, bestCoins: 0, bestTime: 0 },
    2: { completed: false, bestCoins: 0, bestTime: 0 },
  },
});

export function loadSave(): SaveData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as SaveData;
    return { ...empty(), ...parsed, levels: { ...empty().levels, ...parsed.levels } };
  } catch {
    return empty();
  }
}

export function saveLevelResult(
  level: number,
  result: { coins: number; timeSeconds: number; completed: boolean },
): SaveData {
  const data = loadSave();
  const prev = data.levels[level] ?? { completed: false, bestCoins: 0, bestTime: 0 };
  const updated: LevelProgress = {
    completed: prev.completed || result.completed,
    bestCoins: Math.max(prev.bestCoins, result.coins),
    bestTime:
      result.completed && (prev.bestTime === 0 || result.timeSeconds < prev.bestTime)
        ? result.timeSeconds
        : prev.bestTime,
  };
  data.levels[level] = updated;
  data.totalCoins += result.coins;
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export function resetSave(): SaveData {
  const fresh = empty();
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

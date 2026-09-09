import { runtime, resetRun, type Weather } from "./runtime";
import type { AmenityKind, QuestId } from "./world";

const KEY = "dalontan-save-v1";
const VERSION = 1;

interface SaveBlob {
  version: number;
  timeHours: number;
  day: number;
  weather: Weather;
  player: { x: number; z: number; yaw: number };
  needs: typeof runtime.needs;
  coins: number;
  cleanliness: number;
  nature: number;
  harmony: number;
  placed: { id: number; kind: AmenityKind; x: number; z: number; yaw: number }[];
  quests: Record<QuestId, number>;
  questDone: string[];
  peaks: string[];
  muted: boolean;
}

function snapshot(): SaveBlob {
  return {
    version: VERSION,
    timeHours: runtime.timeHours,
    day: runtime.day,
    weather: runtime.weather,
    player: { x: runtime.player.x, z: runtime.player.z, yaw: runtime.player.yaw },
    needs: { ...runtime.needs },
    coins: runtime.coins,
    cleanliness: runtime.cleanliness,
    nature: runtime.nature,
    harmony: runtime.harmony,
    placed: runtime.placed.map((p) => ({ ...p })),
    quests: { ...runtime.quests },
    questDone: [...runtime.questDone],
    peaks: [...runtime.peaks],
    muted: runtime.muted,
  };
}

export function saveGame() {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot()));
  } catch {
    /* private mode */
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const s = JSON.parse(raw) as SaveBlob;
    if (!s || s.version !== VERSION) return false;
    runtime.timeHours = s.timeHours;
    runtime.day = s.day;
    runtime.weather = s.weather;
    runtime.player.x = s.player.x;
    runtime.player.z = s.player.z;
    runtime.player.yaw = s.player.yaw;
    runtime.cam.yaw = s.player.yaw;
    runtime.needs = { ...runtime.needs, ...s.needs };
    runtime.coins = s.coins;
    runtime.cleanliness = s.cleanliness;
    runtime.nature = s.nature;
    runtime.harmony = s.harmony;
    runtime.placed = s.placed ?? [];
    runtime.quests = { ...runtime.quests, ...s.quests };
    runtime.questDone = new Set(s.questDone ?? []);
    runtime.peaks = new Set(s.peaks ?? []);
    runtime.muted = !!s.muted;
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  resetRun();
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

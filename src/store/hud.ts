import { create } from "zustand";
import { clockLabel, runtime, stars, type Phase, type Weather } from "@/game/runtime";
import type { AmenityKind, NeedKey, QuestId } from "@/game/world";
import { QUESTS } from "@/game/world";

export interface HudSnap {
  phase: Phase;
  clock: string;
  day: number;
  weather: Weather;
  visitors: number;
  harmony: number;
  cleanliness: number;
  nature: number;
  coins: number;
  stars: number;
  needs: Record<NeedKey, number>;
  nearbyName: string;
  nearbyEn: string;
  prompt: string;
  toast: string;
  activity: { t: number; dur: number; label: string } | null;
  mapView: boolean;
  build: AmenityKind | null;
  quests: Record<QuestId, number>;
  questDone: string[];
  muted: boolean;
  placed: number;
  diaryDone: number;
  diaryTotal: number;
}

function snap(): HudSnap {
  return {
    phase: runtime.phase,
    clock: clockLabel(),
    day: runtime.day,
    weather: runtime.weather,
    visitors: runtime.visitors.length,
    harmony: Math.round(runtime.harmony),
    cleanliness: Math.round(runtime.cleanliness),
    nature: Math.round(runtime.nature),
    coins: runtime.coins,
    stars: stars(),
    needs: { ...runtime.needs },
    nearbyName: runtime.nearby?.name ?? "",
    nearbyEn: runtime.nearby?.nameEn ?? "",
    prompt: runtime.prompt,
    toast: runtime.toastT > 0 ? runtime.toast : "",
    activity: runtime.activity ? { ...runtime.activity } : null,
    mapView: runtime.cam.mapView,
    build: runtime.build,
    quests: { ...runtime.quests },
    questDone: [...runtime.questDone],
    muted: runtime.muted,
    placed: runtime.placed.length,
    diaryDone: runtime.questDone.size,
    diaryTotal: QUESTS.length,
  };
}

export const useHud = create<HudSnap & { pull: () => void }>((set) => ({
  ...snap(),
  pull: () => set(snap()),
}));

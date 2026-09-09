import {
  AMENITIES,
  type AmenityKind,
  POIS,
  START,
  VISITOR_COLORS,
  VISITOR_NAMES,
  WORLD,
  clampWorld,
  dist2,
  heightAt,
  lakeDepth,
  nearestPoi,
  pathDist,
  poiById,
  resolveBlockers,
  slopeAt,
  surfaceHeight,
  type NeedKey,
  type Poi,
  type QuestId,
} from "./world";

export type Weather = "clear" | "mist" | "overcast" | "rain";
export type Phase = "title" | "playing" | "paused";

export interface Needs {
  hunger: number;
  fun: number;
  rest: number;
  wonder: number;
  social: number;
}

export interface Visitor {
  id: number;
  name: string;
  color: string;
  x: number;
  z: number;
  y: number;
  yaw: number;
  tx: number;
  tz: number;
  speed: number;
  idle: number;
  mood: number;
  poi: string | null;
}

export interface Litter {
  id: number;
  x: number;
  z: number;
}

export interface Placed {
  id: number;
  kind: AmenityKind;
  x: number;
  z: number;
  yaw: number;
}

export interface Activity {
  poiId: string;
  t: number;
  dur: number;
  label: string;
}

export const runtime = {
  phase: "title" as Phase,
  ready: false,
  timeHours: 8.6,
  day: 1,
  weather: "clear" as Weather,
  weatherT: 0,
  player: {
    x: START.x,
    y: 1,
    z: START.z,
    yaw: 0.4,
    speed: 0,
    vy: 0,
    grounded: true,
  },
  cam: {
    yaw: 0.4,
    pitch: 0.28,
    dist: 9.4,
    titleT: 0,
    mapView: false,
  },
  keys: new Set<string>(),
  injectedKeys: null as string[] | null,
  touch: { x: 0, y: 0, lookX: 0, lookY: 0, interact: false },
  needs: { hunger: 72, fun: 55, rest: 80, wonder: 40, social: 35 } as Needs,
  coins: 48,
  cleanliness: 86,
  nature: 70,
  harmony: 62,
  visitors: [] as Visitor[],
  litter: [] as Litter[],
  placed: [] as Placed[],
  activity: null as Activity | null,
  nearby: null as Poi | null,
  toast: "" as string,
  toastT: 0,
  prompt: "" as string,
  greetSet: new Set<number>(),
  peaks: new Set<string>(),
  quests: {
    peaks: 0,
    feast: 0,
    spin: 0,
    bridge: 0,
    greet: 0,
    drum: 0,
    garden: 0,
    dusk: 0,
  } as Record<QuestId, number>,
  questDone: new Set<string>(),
  history: [] as { t: number; harmony: number; visitors: number }[],
  build: null as AmenityKind | null,
  muted: false,
  lookDragging: false,
  hudClock: 0,
  interactHeld: false,
  interactEdge: false,
  jumpEdge: false,
  mapEdge: false,
  pauseEdge: false,
};

let litterSeq = 1;
let placeSeq = 1;
let visitorSeq = 1;
let simAcc = 0;
let litterAcc = 0;
let histAcc = 0;
let footAcc = 0;

function held(code: string): boolean {
  if (runtime.injectedKeys) return runtime.injectedKeys.includes(code);
  return runtime.keys.has(code);
}

export function radialDeadzone(x: number, y: number, dz = 0.15): { x: number; y: number } {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

function clampNeed(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function weatherFor(day: number, hour: number): Weather {
  const h = Math.floor(hour);
  const n = Math.sin(day * 12.7 + h * 3.1) * 43758.5;
  const u = n - Math.floor(n);
  if (u < 0.08) return "rain";
  if (u < 0.22) return "mist";
  if (u < 0.4) return "overcast";
  return "clear";
}

function seedVisitors(n: number) {
  runtime.visitors = [];
  for (let i = 0; i < n; i++) {
    const poi = POIS[Math.floor((i * 7 + 3) % POIS.length)]!;
    const jitter = (k: number) => (Math.sin(i * 19.1 + k) * 2.2);
    const x = poi.x + jitter(1);
    const z = poi.z + jitter(2);
    runtime.visitors.push({
      id: visitorSeq++,
      name: VISITOR_NAMES[i % VISITOR_NAMES.length]!,
      color: VISITOR_COLORS[i % VISITOR_COLORS.length]!,
      x,
      z,
      y: surfaceHeight(x, z),
      yaw: Math.sin(i) * 6,
      tx: x,
      tz: z,
      speed: 1.5 + (i % 5) * 0.18,
      idle: i * 0.4,
      mood: 55 + (i % 9) * 4,
      poi: poi.id,
    });
  }
}

seedVisitors(16);

export function resetRun() {
  runtime.timeHours = 8.6;
  runtime.day = 1;
  runtime.weather = "clear";
  runtime.player.x = START.x;
  runtime.player.z = START.z;
  runtime.player.y = surfaceHeight(START.x, START.z);
  runtime.player.yaw = 0.4;
  runtime.player.speed = 0;
  runtime.player.vy = 0;
  runtime.cam.yaw = 0.4;
  runtime.cam.pitch = 0.28;
  runtime.cam.dist = 9.4;
  runtime.cam.mapView = false;
  runtime.needs = { hunger: 72, fun: 55, rest: 80, wonder: 40, social: 35 };
  runtime.coins = 48;
  runtime.cleanliness = 86;
  runtime.nature = 70;
  runtime.harmony = 62;
  runtime.litter = [];
  runtime.activity = null;
  runtime.greetSet = new Set();
  runtime.peaks = new Set();
  runtime.quests = { peaks: 0, feast: 0, spin: 0, bridge: 0, greet: 0, drum: 0, garden: 0, dusk: 0 };
  runtime.questDone = new Set();
  runtime.history = [];
  runtime.build = null;
  seedVisitors(16);
}

function pickVisitorTarget(v: Visitor) {
  const hour = runtime.timeHours;
  let pool = POIS;
  if (hour < 8 || hour > 20) pool = POIS.filter((p) => p.kind === "village" || p.kind === "rest" || p.kind === "food");
  else if (runtime.weather === "rain") pool = POIS.filter((p) => p.kind !== "peak" && p.kind !== "play");
  const poi = pool[Math.floor(Math.random() * pool.length)] ?? POIS[0]!;
  v.tx = poi.x + (Math.random() - 0.5) * 2.4;
  v.tz = poi.z + (Math.random() - 0.5) * 2.4;
  v.poi = poi.id;
  v.idle = 2 + Math.random() * 6;
}

function stepVisitors(dt: number) {
  const targetCount =
    runtime.phase === "title"
      ? 16
      : Math.round((9 + Math.sin(((runtime.timeHours - 10) / 12) * Math.PI) * 10) * (runtime.weather === "rain" ? 0.55 : 1) * (0.7 + runtime.harmony / 250));

  while (runtime.visitors.length < targetCount && runtime.visitors.length < 22) {
    const gate = Math.random() < 0.5 ? poiById("north-gate")! : poiById("east-gate")!;
    runtime.visitors.push({
      id: visitorSeq++,
      name: VISITOR_NAMES[visitorSeq % VISITOR_NAMES.length]!,
      color: VISITOR_COLORS[visitorSeq % VISITOR_COLORS.length]!,
      x: gate.x,
      z: gate.z,
      y: surfaceHeight(gate.x, gate.z),
      yaw: 0,
      tx: gate.x,
      tz: gate.z,
      speed: 1.4 + Math.random() * 0.8,
      idle: 0.2,
      mood: 50 + Math.random() * 30,
      poi: gate.id,
    });
    pickVisitorTarget(runtime.visitors[runtime.visitors.length - 1]!);
  }
  while (runtime.visitors.length > targetCount && runtime.visitors.length > 6) runtime.visitors.pop();

  for (const v of runtime.visitors) {
    if (v.idle > 0) {
      v.idle -= dt;
      v.speed = Math.max(0, v.speed - dt * 4);
      v.y = surfaceHeight(v.x, v.z);
      v.mood = Math.min(100, v.mood + dt * 0.4);
      continue;
    }
    let dx = v.tx - v.x;
    let dz = v.tz - v.z;
    let dist = Math.hypot(dx, dz);
    if (dist < 1.3) {
      v.idle = 3 + Math.random() * 8;
      pickVisitorTarget(v);
      continue;
    }
    dx /= dist;
    dz /= dist;
    const look = 1.4;
    const ahead = heightAt(v.x + dx * look, v.z + dz * look);
    if (ahead < -0.15 && !((v.x > 18 && v.x < 36 && v.z > 12 && v.z < 20))) {
      const px = -dz;
      const pz = dx;
      const left = heightAt(v.x + px * 2, v.z + pz * 2);
      dx = left > ahead ? px : -px;
      dz = left > ahead ? pz : -pz;
    }
    const sp = v.speed * dt;
    v.x += dx * sp;
    v.z += dz * sp;
    const cl = clampWorld(v.x, v.z);
    v.x = cl.x;
    v.z = cl.z;
    v.y = surfaceHeight(v.x, v.z);
    v.yaw = Math.atan2(-dx, -dz);
    v.mood = Math.min(100, v.mood + dt * 0.15);
  }
}

function spawnLitter() {
  if (runtime.litter.length >= 8) return;
  const pathPoi = POIS[Math.floor(Math.random() * POIS.length)]!;
  const x = pathPoi.x + (Math.random() - 0.5) * 8;
  const z = pathPoi.z + (Math.random() - 0.5) * 8;
  if (heightAt(x, z) < 0.3) return;
  runtime.litter.push({ id: litterSeq++, x, z });
}

function applyQuest(id: QuestId, add = 1) {
  if (runtime.questDone.has(id)) return;
  runtime.quests[id] = Math.min(99, runtime.quests[id] + add);
  const def = { peaks: 5, feast: 1, spin: 1, bridge: 1, greet: 1, drum: 1, garden: 1, dusk: 1 }[id];
  const need = id === "peaks" ? 5 : id === "greet" ? 6 : def;
  if (runtime.quests[id] >= need) {
    runtime.questDone.add(id);
    runtime.coins += 16;
    runtime.harmony = Math.min(100, runtime.harmony + 4);
    runtime.toast = "Diary complete · +16 tokens";
    runtime.toastT = 3.2;
  }
}

function startActivity(poi: Poi) {
  if (runtime.activity) return;
  runtime.activity = { poiId: poi.id, t: 0, dur: poi.duration, label: poi.name };
}

function finishActivity(poi: Poi) {
  const e = poi.effects;
  const n = runtime.needs;
  n.hunger = clampNeed(n.hunger + (e.hunger ?? 0));
  n.fun = clampNeed(n.fun + (e.fun ?? 0));
  n.rest = clampNeed(n.rest + (e.rest ?? 0));
  n.wonder = clampNeed(n.wonder + (e.wonder ?? 0));
  n.social = clampNeed(n.social + (e.social ?? 0));
  runtime.coins = Math.max(0, runtime.coins + (e.coins ?? 0));
  runtime.cleanliness = clampNeed(runtime.cleanliness + (e.clean ?? 0));
  runtime.nature = clampNeed(runtime.nature + (e.nature ?? 0));
  runtime.harmony = clampNeed(runtime.harmony + (e.harmony ?? 0));

  if (poi.kind === "peak") {
    if (!runtime.peaks.has(poi.id)) {
      runtime.peaks.add(poi.id);
      applyQuest("peaks", 1);
    }
    if (poi.id === "couple" && runtime.timeHours >= 17 && runtime.timeHours <= 19) applyQuest("dusk");
  }
  if (poi.id === "restaurant") applyQuest("feast");
  if (poi.id === "amusement") applyQuest("spin");
  if (poi.id === "bridge") applyQuest("bridge");
  if (poi.id === "drum" || poi.id === "photo") applyQuest("drum");
  if (poi.id === "garden") applyQuest("garden");

  runtime.toast = poi.nameEn;
  runtime.toastT = 2.1;
}

export function placeAmenity(kind: AmenityKind, x: number, z: number): boolean {
  const def = AMENITIES.find((a) => a.id === kind);
  if (!def) return false;
  if (runtime.coins < def.cost) {
    runtime.toast = "Not enough tokens";
    runtime.toastT = 2;
    return false;
  }
  if (heightAt(x, z) < 0.25 || lakeDepth(x, z) > 0.4) {
    runtime.toast = "Can't place on water";
    runtime.toastT = 2;
    return false;
  }
  if (runtime.placed.length >= 28) {
    runtime.toast = "Park is full";
    runtime.toastT = 2;
    return false;
  }
  runtime.coins -= def.cost;
  runtime.placed.push({ id: placeSeq++, kind, x, z, yaw: runtime.player.yaw });
  runtime.nature = clampNeed(runtime.nature + def.nature);
  runtime.harmony = clampNeed(runtime.harmony + def.harmony);
  runtime.toast = `Placed ${def.nameEn}`;
  runtime.toastT = 1.8;
  return true;
}

function tryInteract() {
  const p = runtime.player;
  if (runtime.build) {
    const fx = -Math.sin(runtime.player.yaw);
    const fz = -Math.cos(runtime.player.yaw);
    placeAmenity(runtime.build, p.x + fx * 2.4, p.z + fz * 2.4);
    return;
  }
  const litter = runtime.litter.find((l) => dist2(p.x, p.z, l.x, l.z) < 2.6 * 2.6);
  if (litter) {
    runtime.litter = runtime.litter.filter((l) => l.id !== litter.id);
    runtime.cleanliness = clampNeed(runtime.cleanliness + 8);
    runtime.coins += 3;
    runtime.harmony = clampNeed(runtime.harmony + 1);
    runtime.toast = "Picked up litter · +3";
    runtime.toastT = 1.6;
    return;
  }
  const poi = nearestPoi(p.x, p.z, 0.4);
  if (poi && poi.duration > 0.5) startActivity(poi);
}

function pollGamepad(dt: number) {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  const pad = pads[0];
  if (!pad) return;
  const ls = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
  runtime.touch.x = ls.x;
  runtime.touch.y = -ls.y;
  const rs = radialDeadzone(pad.axes[2] ?? 0, pad.axes[3] ?? 0, 0.12);
  runtime.cam.yaw -= rs.x * 1.6 * dt;
  runtime.cam.pitch = Math.max(-0.08, Math.min(0.72, runtime.cam.pitch + rs.y * 1.1 * dt));
  if (pad.buttons[0]?.pressed && runtime.player.grounded) runtime.jumpEdge = true;
  if (pad.buttons[9]?.pressed) runtime.pauseEdge = true;
}

function stepPlayer(dt: number) {
  const p = runtime.player;
  if (runtime.activity) {
    runtime.activity.t += dt;
    p.speed = 0;
    if (runtime.activity.t >= runtime.activity.dur) {
      const poi = poiById(runtime.activity.poiId);
      if (poi) finishActivity(poi);
      runtime.activity = null;
    }
    p.y = surfaceHeight(p.x, p.z);
    return;
  }

  let mx = 0;
  let mz = 0;
  if (held("KeyW") || held("ArrowUp")) mz += 1;
  if (held("KeyS") || held("ArrowDown")) mz -= 1;
  if (held("KeyD") || held("ArrowRight")) mx += 1;
  if (held("KeyA") || held("ArrowLeft")) mx -= 1;
  mx += runtime.touch.x;
  mz += runtime.touch.y;
  const mag = Math.hypot(mx, mz);
  if (mag > 1) {
    mx /= mag;
    mz /= mag;
  }

  if (held("KeyQ")) runtime.cam.yaw += 1.5 * dt;
  if (held("KeyE")) runtime.cam.yaw -= 1.5 * dt;
  runtime.cam.yaw -= runtime.touch.lookX * 1.8 * dt;
  runtime.cam.pitch = Math.max(-0.08, Math.min(0.72, runtime.cam.pitch + runtime.touch.lookY * 1.2 * dt));

  const yaw = runtime.cam.yaw;
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const rx = Math.cos(yaw);
  const rz = -Math.sin(yaw);
  const wx = fx * mz + rx * mx;
  const wz = fz * mz + rz * mx;
  const wish = Math.hypot(wx, wz);

  const sprint = held("ShiftLeft") || held("ShiftRight");
  const maxSp = (sprint ? 8.4 : 5.6) * (runtime.needs.rest < 15 ? 0.72 : 1);
  if (wish > 0.08) {
    p.speed = Math.min(maxSp, p.speed + dt * 14);
    p.yaw = Math.atan2(-wx, -wz);
  } else {
    p.speed = Math.max(0, p.speed - dt * 16);
  }

  if ((held("Space") || runtime.jumpEdge) && p.grounded) {
    p.vy = 4.6;
    p.grounded = false;
  }
  runtime.jumpEdge = false;

  if (wish > 0.08 && p.speed > 0.2) {
    const step = p.speed * dt;
    let nx = p.x + (wx / wish) * step;
    let nz = p.z + (wz / wish) * step;
    const cl = clampWorld(nx, nz);
    nx = cl.x;
    nz = cl.z;
    const blocked = resolveBlockers(nx, nz);
    nx = blocked.x;
    nz = blocked.z;
    const nextH = surfaceHeight(nx, nz);
    const sl = slopeAt(nx, nz);
    if (sl > 1.55 && nextH > p.y + 0.55) {
      // blocked by cliff — try axis slide
    } else {
      p.x = nx;
      p.z = nz;
    }
  }

  p.vy -= 16 * dt;
  let ground = surfaceHeight(p.x, p.z);
  p.y += p.vy * dt;
  if (p.y <= ground) {
    p.y = ground;
    p.vy = 0;
    p.grounded = true;
  }

  p.x = Math.max(-WORLD * 0.47, Math.min(WORLD * 0.47, p.x));
  p.z = Math.max(-WORLD * 0.47, Math.min(WORLD * 0.47, p.z));

  if (pathDist(p.x, p.z) < 2.4) runtime.needs.rest = clampNeed(runtime.needs.rest + dt * 0.4);

  for (const v of runtime.visitors) {
    if (dist2(p.x, p.z, v.x, v.z) < 2.4 * 2.4 && !runtime.greetSet.has(v.id)) {
      runtime.greetSet.add(v.id);
      runtime.needs.social = clampNeed(runtime.needs.social + 6);
      applyQuest("greet", 1);
    }
  }
}

function tickNeeds(dt: number) {
  const n = runtime.needs;
  n.hunger = clampNeed(n.hunger - dt * 0.55);
  n.fun = clampNeed(n.fun - dt * 0.32);
  n.rest = clampNeed(n.rest - dt * 0.4);
  n.wonder = clampNeed(n.wonder - dt * 0.22);
  n.social = clampNeed(n.social - dt * 0.18);
  const avg = (n.hunger + n.fun + n.rest + n.wonder + n.social) / 5;
  const visitorMood =
    runtime.visitors.reduce((s, v) => s + v.mood, 0) / Math.max(1, runtime.visitors.length);
  const amenity = runtime.placed.length * 0.7;
  runtime.harmony = clampNeed(
    runtime.harmony * 0.986 +
      (avg * 0.28 + visitorMood * 0.22 + runtime.cleanliness * 0.22 + runtime.nature * 0.18 + amenity) * 0.014,
  );
  runtime.nature = clampNeed(runtime.nature + (runtime.weather === "rain" ? dt * 0.4 : -dt * 0.05));
  runtime.cleanliness = clampNeed(runtime.cleanliness - runtime.litter.length * dt * 0.35);
}

export function stars(): number {
  const h = runtime.harmony;
  if (h >= 88) return 5;
  if (h >= 74) return 4;
  if (h >= 58) return 3;
  if (h >= 40) return 2;
  return 1;
}

export function clockLabel(): string {
  const h = Math.floor(runtime.timeHours) % 24;
  const m = Math.floor((runtime.timeHours % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function stepGame(dt: number) {
  const d = Math.min(dt, 0.1);
  if (runtime.phase === "paused") return;

  if (runtime.phase === "title") {
    runtime.cam.titleT += d;
    runtime.timeHours = (runtime.timeHours + d * (2 / 60)) % 24;
    stepVisitors(d);
    return;
  }

  pollGamepad(d);

  if (held("KeyM") && !runtime.mapEdge) {
    runtime.cam.mapView = !runtime.cam.mapView;
  }
  runtime.mapEdge = held("KeyM");

  if ((held("Escape") || held("KeyP")) && !runtime.pauseEdge) {
    runtime.phase = "paused";
  }
  runtime.pauseEdge = held("Escape") || held("KeyP");

  const interact = held("KeyE") || held("KeyF") || runtime.touch.interact || runtime.interactHeld;
  if (interact && !runtime.interactEdge) tryInteract();
  runtime.interactEdge = interact;
  runtime.touch.interact = false;

  if (held("Digit1")) runtime.build = "bench";
  if (held("Digit2")) runtime.build = "lantern";
  if (held("Digit3")) runtime.build = "flowers";
  if (held("Digit4")) runtime.build = "stall";
  if (held("Digit0") || held("KeyG")) runtime.build = null;

  stepPlayer(d);

  simAcc += d;
  while (simAcc >= 0.05) {
    const tick = 0.05;
    runtime.timeHours += tick * (2.4 / 60);
    if (runtime.timeHours >= 24) {
      runtime.timeHours -= 24;
      runtime.day += 1;
    }
    runtime.weatherT += tick;
    if (runtime.weatherT > 48) {
      runtime.weatherT = 0;
      runtime.weather = weatherFor(runtime.day, runtime.timeHours);
    }
    stepVisitors(tick);
    tickNeeds(tick);
    simAcc -= tick;
  }

  litterAcc += d;
  if (litterAcc > 18) {
    litterAcc = 0;
    if (Math.random() < 0.55) spawnLitter();
  }

  histAcc += d;
  if (histAcc > 4) {
    histAcc = 0;
    runtime.history.push({ t: runtime.day * 24 + runtime.timeHours, harmony: runtime.harmony, visitors: runtime.visitors.length });
    if (runtime.history.length > 36) runtime.history.shift();
  }

  if (runtime.toastT > 0) runtime.toastT -= d;
  else runtime.toast = "";

  const poi = nearestPoi(runtime.player.x, runtime.player.z, 0.35);
  runtime.nearby = poi;
  if (runtime.build) runtime.prompt = `Place ${runtime.build}  ·  E`;
  else if (runtime.litter.some((l) => dist2(runtime.player.x, runtime.player.z, l.x, l.z) < 2.6 * 2.6))
    runtime.prompt = "Pick up litter  ·  E";
  else if (poi && poi.duration > 0.5) runtime.prompt = `${poi.name}  ·  E`;
  else runtime.prompt = "";

  runtime.hudClock += d;
}

export function getMoveAxes(): { mx: number; mz: number; yaw: number; speed: number } {
  return { mx: 0, mz: 0, yaw: runtime.player.yaw, speed: runtime.player.speed };
}

export { held, footAcc };
export function bumpFoot(dt: number): boolean {
  if (runtime.player.speed < 0.6 || !runtime.player.grounded) {
    footAcc = 0;
    return false;
  }
  footAcc += dt * runtime.player.speed;
  if (footAcc > 1.15) {
    footAcc = 0;
    return true;
  }
  return false;
}

export function attachInput(target: HTMLElement | Window) {
  const down = (e: KeyboardEvent) => {
    runtime.keys.add(e.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyE", "KeyF"].includes(e.code)) {
      e.preventDefault();
    }
  };
  const up = (e: KeyboardEvent) => {
    runtime.keys.delete(e.code);
  };
  const clear = () => runtime.keys.clear();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
    __dalontan?: typeof runtime;
  }
}

export function installControlsProbe() {
  if (typeof window === "undefined") return;
  window.__controlsTest = {
    getYaw: () => runtime.player.yaw,
    getSpeed: () => runtime.player.speed,
    setKeys: (codes: string[]) => {
      runtime.injectedKeys = codes.length ? codes : null;
      if (codes.length && runtime.phase === "title") runtime.phase = "playing";
    },
    setSteer: (v: number) => {
      runtime.injectedKeys = v > 0.1 ? ["KeyW", "KeyA"] : v < -0.1 ? ["KeyW", "KeyD"] : ["KeyW"];
    },
  };
  window.__dalontan = runtime;
}

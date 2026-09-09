export const WORLD = 148;
export const WATER_Y = 0;
export const PATH_WIDTH = 2.15;

export type NeedKey = "hunger" | "fun" | "rest" | "wonder" | "social";

export type PoiKind =
  | "peak"
  | "gate"
  | "village"
  | "garden"
  | "tower"
  | "bridge"
  | "food"
  | "ride"
  | "rest"
  | "ruin"
  | "water"
  | "shop"
  | "photo"
  | "spring"
  | "service"
  | "play"
  | "camp"
  | "flag";

export type AmenityKind = "bench" | "lantern" | "flowers" | "stall";

export interface Poi {
  id: string;
  name: string;
  nameEn: string;
  kind: PoiKind;
  x: number;
  z: number;
  radius: number;
  hint: string;
  duration: number;
  capacity: number;
  effects: Partial<Record<NeedKey, number>> & {
    coins?: number;
    clean?: number;
    nature?: number;
    harmony?: number;
  };
}

export const MOUNTAINS: { id: string; x: number; z: number; h: number; r: number }[] = [
  { id: "couple", x: -36, z: -34, h: 17.5, r: 11.5 },
  { id: "beauty", x: -10, z: -20, h: 7.2, r: 6.4 },
  { id: "tiger", x: 5, z: 3, h: 14.8, r: 9.4 },
  { id: "dragon", x: -42, z: 22, h: 12.6, r: 8.2 },
  { id: "thunder", x: -16, z: 46, h: 11.4, r: 7.4 },
  { id: "sedan", x: 22, z: 52, h: 13.2, r: 8.0 },
  { id: "lion", x: 46, z: 20, h: 12.4, r: 7.6 },
  { id: "east", x: 54, z: -30, h: 9.8, r: 7.8 },
  { id: "west-knoll", x: -52, z: -18, h: 6.4, r: 5.6 },
  { id: "south-knoll", x: 8, z: 60, h: 5.8, r: 5.2 },
];

export const LAKES: { x: number; z: number; rx: number; rz: number; depth: number }[] = [
  { x: 1, z: 26, rx: 34, rz: 20, depth: 2.6 },
  { x: -5, z: -10, rx: 17, rz: 11, depth: 1.7 },
  { x: 30, z: 6, rx: 19, rz: 13, depth: 2.0 },
  { x: 18, z: 14, rx: 16, rz: 9, depth: 1.8 },
  { x: 40, z: -22, rx: 11, rz: 9, depth: 1.5 },
];

export const START = { x: -24, z: -41 };

export const POIS: Poi[] = [
  {
    id: "start",
    name: "你在这里",
    nameEn: "Your position",
    kind: "flag",
    x: START.x,
    z: START.z,
    radius: 3,
    hint: "Park entrance trail",
    duration: 0.4,
    capacity: 4,
    effects: { wonder: 4 },
  },
  {
    id: "north-gate",
    name: "北门",
    nameEn: "North Gate",
    kind: "gate",
    x: -46,
    z: -6,
    radius: 3.4,
    hint: "Paifang into the west gardens",
    duration: 1.4,
    capacity: 8,
    effects: { wonder: 6, social: 4, coins: 2 },
  },
  {
    id: "east-gate",
    name: "东门",
    nameEn: "East Gate",
    kind: "gate",
    x: 61,
    z: -34,
    radius: 3.4,
    hint: "Hill road toward Pine Lodge",
    duration: 1.4,
    capacity: 8,
    effects: { wonder: 6, rest: 3 },
  },
  {
    id: "couple",
    name: "情侣峰",
    nameEn: "Couple Peak",
    kind: "peak",
    x: -36,
    z: -34,
    radius: 4.2,
    hint: "Best dusk view of Mirror Lake",
    duration: 3.2,
    capacity: 6,
    effects: { wonder: 22, rest: 8, social: 6, coins: 6 },
  },
  {
    id: "beauty",
    name: "美女峰",
    nameEn: "Beauty Peak",
    kind: "peak",
    x: -10,
    z: -20,
    radius: 3.4,
    hint: "A gentle knoll above the north pond",
    duration: 2.2,
    capacity: 5,
    effects: { wonder: 14, rest: 6 },
  },
  {
    id: "tiger",
    name: "卧虎山",
    nameEn: "Crouching Tiger",
    kind: "peak",
    x: 5,
    z: 3,
    radius: 4,
    hint: "The park's heart mountain",
    duration: 3,
    capacity: 6,
    effects: { wonder: 18, rest: 5, coins: 5 },
  },
  {
    id: "dragon",
    name: "龙山",
    nameEn: "Dragon Mountain",
    kind: "peak",
    x: -42,
    z: 22,
    radius: 3.8,
    hint: "West ridge over the tea house",
    duration: 2.8,
    capacity: 5,
    effects: { wonder: 16, rest: 5 },
  },
  {
    id: "thunder",
    name: "雷山",
    nameEn: "Thunder Mountain",
    kind: "peak",
    x: -16,
    z: 46,
    radius: 3.6,
    hint: "South wind and drum echoes",
    duration: 2.6,
    capacity: 5,
    effects: { wonder: 15, fun: 4 },
  },
  {
    id: "sedan",
    name: "轿顶山",
    nameEn: "Sedan Peak",
    kind: "peak",
    x: 22,
    z: 52,
    radius: 3.8,
    hint: "Look down on the amusement pier",
    duration: 2.8,
    capacity: 5,
    effects: { wonder: 16, rest: 4 },
  },
  {
    id: "lion",
    name: "仰狮山",
    nameEn: "Lion Mountain",
    kind: "peak",
    x: 46,
    z: 20,
    radius: 3.6,
    hint: "East sentinel of the bay",
    duration: 2.6,
    capacity: 5,
    effects: { wonder: 15, rest: 4 },
  },
  {
    id: "garden",
    name: "辛柳友谊园",
    nameEn: "Cincinnati–Liuzhou Garden",
    kind: "garden",
    x: -16,
    z: -2,
    radius: 4.5,
    hint: "Tend camellias for the sister city",
    duration: 3.4,
    capacity: 10,
    effects: { rest: 10, nature: 14, wonder: 8, harmony: 6, coins: 4 },
  },
  {
    id: "volunteer",
    name: "志愿者服务站",
    nameEn: "Volunteer desk",
    kind: "service",
    x: -34,
    z: 6,
    radius: 3,
    hint: "Pick up a park diary and a map",
    duration: 1.8,
    capacity: 4,
    effects: { social: 10, wonder: 4, coins: 3 },
  },
  {
    id: "restaurant",
    name: "中餐",
    nameEn: "Chinese restaurant",
    kind: "food",
    x: -58,
    z: -3,
    radius: 3.6,
    hint: "River-fish and osmanthus tea",
    duration: 4.2,
    capacity: 8,
    effects: { hunger: 38, social: 8, rest: 4, coins: -4 },
  },
  {
    id: "miao",
    name: "苗寨",
    nameEn: "Miao village",
    kind: "village",
    x: 4,
    z: -51,
    radius: 4.4,
    hint: "Stilt houses and silver song",
    duration: 3,
    capacity: 10,
    effects: { social: 14, wonder: 10, fun: 6, coins: 3 },
  },
  {
    id: "yao",
    name: "瑶寨",
    nameEn: "Yao village",
    kind: "village",
    x: 24,
    z: -44,
    radius: 4.2,
    hint: "Indigo cloth drying in the wind",
    duration: 3,
    capacity: 10,
    effects: { social: 12, wonder: 10, rest: 4 },
  },
  {
    id: "dong",
    name: "侗乡深处",
    nameEn: "Dong courtyard",
    kind: "village",
    x: 38,
    z: -18,
    radius: 4,
    hint: "Drum-song and fire-pit tea",
    duration: 3.2,
    capacity: 8,
    effects: { social: 12, rest: 8, wonder: 8 },
  },
  {
    id: "pine",
    name: "丝松山房",
    nameEn: "Pine Lodge",
    kind: "rest",
    x: 46,
    z: -30,
    radius: 3.4,
    hint: "Quiet rooms under the east pines",
    duration: 3.6,
    capacity: 6,
    effects: { rest: 28, hunger: 6 },
  },
  {
    id: "drum",
    name: "鼓楼",
    nameEn: "Drum Tower",
    kind: "tower",
    x: 34,
    z: 8,
    radius: 3.8,
    hint: "Climb for a photograph of the bay",
    duration: 3.5,
    capacity: 8,
    effects: { wonder: 24, fun: 6, coins: 8 },
  },
  {
    id: "bridge",
    name: "风雨桥",
    nameEn: "Wind-Rain Bridge",
    kind: "bridge",
    x: 27,
    z: 16,
    radius: 4.2,
    hint: "Covered walk over the east bay",
    duration: 2.2,
    capacity: 12,
    effects: { wonder: 14, rest: 6, social: 6 },
  },
  {
    id: "amusement",
    name: "镜湖游园",
    nameEn: "Mirror Lake fair",
    kind: "ride",
    x: 6,
    z: 39,
    radius: 5.5,
    hint: "Carousel, wheel, and paper stalls",
    duration: 4.5,
    capacity: 16,
    effects: { fun: 36, social: 10, hunger: -6, coins: -3 },
  },
  {
    id: "tea",
    name: "镜心茶寮",
    nameEn: "Lake tea house",
    kind: "rest",
    x: -22,
    z: 28,
    radius: 3.4,
    hint: "Longjing facing the water",
    duration: 3.8,
    capacity: 8,
    effects: { rest: 22, hunger: 10, wonder: 8, coins: -2 },
  },
  {
    id: "spring",
    name: "龙泉",
    nameEn: "Dragon spring",
    kind: "spring",
    x: -52,
    z: 28,
    radius: 3.4,
    hint: "Warm stone pools in the west ravine",
    duration: 4.4,
    capacity: 6,
    effects: { rest: 32, fun: 8, hunger: -4 },
  },
  {
    id: "ruins",
    name: "古人类遗址",
    nameEn: "Ancient site",
    kind: "ruin",
    x: 8,
    z: 58,
    radius: 3.6,
    hint: "Shell-mound people of the south ridge",
    duration: 3.2,
    capacity: 6,
    effects: { wonder: 26, rest: 4, coins: 7 },
  },
  {
    id: "pavilion",
    name: "侧山楼",
    nameEn: "Side-hill pavilion",
    kind: "rest",
    x: 54,
    z: 30,
    radius: 3.2,
    hint: "A reading loft on Lion Mountain",
    duration: 2.8,
    capacity: 4,
    effects: { rest: 16, wonder: 12 },
  },
  {
    id: "shell",
    name: "贝丘",
    nameEn: "Shell mound",
    kind: "ruin",
    x: 26,
    z: 38,
    radius: 3,
    hint: "White shells in the south grass",
    duration: 2.2,
    capacity: 4,
    effects: { wonder: 14, nature: 6 },
  },
  {
    id: "dock",
    name: "镜湖码头",
    nameEn: "Boat dock",
    kind: "water",
    x: 10,
    z: 16,
    radius: 3.6,
    hint: "Row a skiff on still water",
    duration: 4,
    capacity: 6,
    effects: { fun: 18, rest: 10, wonder: 10, coins: -2 },
  },
  {
    id: "koi",
    name: "锦鲤池",
    nameEn: "Koi pond",
    kind: "water",
    x: 18,
    z: -6,
    radius: 3.2,
    hint: "Feed the red fish",
    duration: 2.4,
    capacity: 6,
    effects: { fun: 12, wonder: 10, nature: 6, coins: -1 },
  },
  {
    id: "lantern",
    name: "灯笼街",
    nameEn: "Lantern street",
    kind: "shop",
    x: -6,
    z: 8,
    radius: 3.6,
    hint: "Paper lights and osmanthus candy",
    duration: 2.6,
    capacity: 10,
    effects: { fun: 10, social: 10, hunger: 8, coins: -2 },
  },
  {
    id: "photo",
    name: "留影台",
    nameEn: "Photo terrace",
    kind: "photo",
    x: 2,
    z: -12,
    radius: 3,
    hint: "Frame the north pond and Beauty Peak",
    duration: 2,
    capacity: 4,
    effects: { wonder: 16, fun: 6, coins: 4 },
  },
  {
    id: "camp",
    name: "疏林营地",
    nameEn: "Pine camp",
    kind: "camp",
    x: 12,
    z: -28,
    radius: 3.4,
    hint: "Canvas tents and a quiet fire",
    duration: 3.4,
    capacity: 6,
    effects: { rest: 18, social: 8, hunger: -4 },
  },
  {
    id: "swings",
    name: "草地秋千",
    nameEn: "Meadow swings",
    kind: "play",
    x: -20,
    z: 12,
    radius: 3,
    hint: "Kick toward Dragon Mountain",
    duration: 2.4,
    capacity: 4,
    effects: { fun: 18, rest: 4 },
  },
  {
    id: "windmill",
    name: "望湖风车",
    nameEn: "Lake mill",
    kind: "photo",
    x: 58,
    z: 8,
    radius: 3,
    hint: "White sails over the east bay",
    duration: 2,
    capacity: 4,
    effects: { wonder: 12, fun: 6 },
  },
  {
    id: "sakura",
    name: "樱花谷",
    nameEn: "Sakura vale",
    kind: "garden",
    x: -28,
    z: -16,
    radius: 4.2,
    hint: "Petals on the north-gate road",
    duration: 2.8,
    capacity: 10,
    effects: { wonder: 18, rest: 8, nature: 10, harmony: 4 },
  },
];

export const PEAK_IDS = ["couple", "beauty", "tiger", "dragon", "thunder", "sedan", "lion"] as const;

export const PATHS: [number, number][][] = [
  [
    [-58, -3],
    [-46, -6],
    [-34, 6],
    [-28, -16],
    [-24, -41],
    [-16, -2],
    [-6, 8],
    [5, 8],
    [10, 16],
    [18, -6],
    [27, 16],
    [34, 8],
    [38, -18],
    [46, -30],
    [61, -34],
  ],
  [
    [-24, -41],
    [-36, -34],
    [-10, -20],
    [2, -12],
    [4, -51],
    [12, -28],
    [24, -44],
    [38, -18],
  ],
  [
    [-46, -6],
    [-42, 22],
    [-52, 28],
    [-22, 28],
    [6, 39],
    [26, 38],
    [22, 52],
    [8, 58],
    [-16, 46],
  ],
  [
    [34, 8],
    [46, 20],
    [54, 30],
    [58, 8],
  ],
  [
    [-16, -2],
    [5, 3],
    [18, -6],
  ],
];

export const BLOCKERS: { x: number; z: number; r: number }[] = [
  { x: -58, z: -3, r: 2.8 },
  { x: -46, z: -6, r: 1.5 },
  { x: 61, z: -34, r: 1.5 },
  { x: 34, z: 8, r: 2.2 },
  { x: 6, z: 39, r: 2.8 },
  { x: 9.4, z: 41.5, r: 2.4 },
  { x: -22, z: 28, r: 2.0 },
  { x: 46, z: -30, r: 2.0 },
  { x: 54, z: 30, r: 1.6 },
  { x: 58, z: 8, r: 1.6 },
  { x: -34, z: 6, r: 1.6 },
  { x: 4, z: -51, r: 1.6 },
  { x: 6.2, z: -49, r: 1.6 },
  { x: 1.6, z: -48.5, r: 1.6 },
  { x: 24, z: -44, r: 1.6 },
  { x: 26.4, z: -42.4, r: 1.6 },
  { x: 22, z: -42, r: 1.6 },
  { x: 38, z: -18, r: 1.6 },
  { x: 40.2, z: -16.5, r: 1.6 },
  { x: 36.2, z: -16.8, r: 1.6 },
  { x: -16, z: -2, r: 1.5 },
];

export const AMENITIES: {
  id: AmenityKind;
  name: string;
  nameEn: string;
  cost: number;
  nature: number;
  harmony: number;
}[] = [
  { id: "bench", name: "长椅", nameEn: "Bench", cost: 18, nature: 0, harmony: 2 },
  { id: "lantern", name: "石灯", nameEn: "Lantern", cost: 14, nature: 0, harmony: 3 },
  { id: "flowers", name: "花畦", nameEn: "Flower bed", cost: 22, nature: 6, harmony: 3 },
  { id: "stall", name: "茶摊", nameEn: "Tea stall", cost: 36, nature: 0, harmony: 5 },
];

export const QUESTS = [
  { id: "peaks", title: "五岳巡礼", titleEn: "Five peaks", desc: "Stand on five named peaks", need: 5 },
  { id: "feast", title: "龙潭味", titleEn: "A proper meal", desc: "Eat at the Chinese restaurant", need: 1 },
  { id: "spin", title: "镜湖回旋", titleEn: "Ride the carousel", desc: "Play at Mirror Lake fair", need: 1 },
  { id: "bridge", title: "风雨过桥", titleEn: "Covered bridge", desc: "Walk the Wind-Rain Bridge", need: 1 },
  { id: "greet", title: "萍水相逢", titleEn: "Greet six visitors", desc: "Pass close to six visitors", need: 6 },
  { id: "drum", title: "鼓楼留影", titleEn: "Drum tower photo", desc: "Photograph the Drum Tower", need: 1 },
  { id: "garden", title: "辛柳浇花", titleEn: "Tend the garden", desc: "Work in the friendship garden", need: 1 },
  { id: "dusk", title: "情侣峰暮色", titleEn: "Couple Peak dusk", desc: "Be on Couple Peak at 17–19h", need: 1 },
] as const;

export type QuestId = (typeof QUESTS)[number]["id"];

export const VISITOR_NAMES = [
  "小禾",
  "阿楠",
  "美月",
  "浩然",
  "りん",
  "悠",
  "青禾",
  "Mina",
  "陆秋",
  "Haru",
  "阿绣",
  "Leo",
  "冬笋",
  "Yuna",
  "石青",
  "Nori",
  "晚晴",
  "Jun",
  "桐",
  "Sora",
];

export const VISITOR_COLORS = [
  "#c45c5c",
  "#4f6f56",
  "#5e93a4",
  "#c98990",
  "#6b5a8a",
  "#d08a4c",
  "#3d6b7a",
  "#8a5a4a",
  "#5a6d8a",
  "#7a8a4f",
];

export function rand(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function dist2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const abx = bx - ax;
  const abz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz || 1)));
  const x = ax + abx * t;
  const z = az + abz * t;
  return Math.hypot(px - x, pz - z);
}

export function pathDist(x: number, z: number): number {
  let best = 99;
  for (const path of PATHS) {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!;
      const b = path[i]!;
      const d = segDist(x, z, a[0], a[1], b[0], b[1]);
      if (d < best) best = d;
    }
  }
  return best;
}

export function lakeDepth(x: number, z: number): number {
  let d = 0;
  for (const l of LAKES) {
    const u = (x - l.x) / l.rx;
    const v = (z - l.z) / l.rz;
    const e = u * u + v * v;
    if (e < 1.15) {
      const t = Math.max(0, 1 - e);
      d = Math.max(d, l.depth * t * t);
    }
  }
  return d;
}

export function heightAt(x: number, z: number): number {
  const edge = Math.max(Math.abs(x), Math.abs(z)) / (WORLD * 0.5);
  let h =
    0.62 +
    Math.sin(x * 0.035) * 0.22 +
    Math.cos(z * 0.028) * 0.18 +
    Math.sin((x + z) * 0.02) * 0.12;
  h += Math.max(0, edge - 0.82) * 10;

  for (const m of MOUNTAINS) {
    const dx = x - m.x;
    const dz = z - m.z;
    const g = Math.exp(-(dx * dx + dz * dz) / (2 * m.r * m.r));
    h += m.h * g;
  }

  h -= lakeDepth(x, z) * 1.55;

  const pd = pathDist(x, z);
  if (pd < PATH_WIDTH + 0.6 && h > 0.15) {
    const k = 1 - pd / (PATH_WIDTH + 0.6);
    const pathH = 0.48 + Math.min(h, 4) * 0.08;
    h = h * (1 - k * 0.78) + pathH * k * 0.78;
  }

  return h;
}

export function slopeAt(x: number, z: number, s = 0.7): number {
  const dx = heightAt(x + s, z) - heightAt(x - s, z);
  const dz = heightAt(x, z + s) - heightAt(x, z - s);
  return Math.hypot(dx, dz) / (2 * s);
}

export function biomeAt(x: number, z: number): "water" | "sand" | "path" | "sakura" | "garden" | "peak" | "grass" | "village" {
  const h = heightAt(x, z);
  if (h < 0.02) return "water";
  if (h < 0.42) return "sand";
  if (pathDist(x, z) < PATH_WIDTH) return "path";
  if (dist2(x, z, -28, -16) < 14 * 14) return "sakura";
  if (dist2(x, z, -16, -2) < 10 * 10) return "garden";
  if (dist2(x, z, 4, -51) < 11 * 11 || dist2(x, z, 24, -44) < 10 * 10 || dist2(x, z, 38, -18) < 9 * 9)
    return "village";
  if (h > 7.5) return "peak";
  return "grass";
}

export function isOnBridge(x: number, z: number): boolean {
  // Wind-rain bridge spans east bay, roughly x 20..34, z 13..19
  return x > 18 && x < 36 && z > 12.2 && z < 19.8;
}

export function isOnDock(x: number, z: number): boolean {
  return dist2(x, z, 10, 16) < 3.2 * 3.2 && z < 18;
}

export function surfaceHeight(x: number, z: number): number {
  if (isOnBridge(x, z)) return 2.15;
  if (isOnDock(x, z)) return 0.42;
  const h = heightAt(x, z);
  if (h < 0.12) return 0.12;
  return h;
}

export function nearestPoi(x: number, z: number, extraR = 0): Poi | null {
  let best: Poi | null = null;
  let bestD = 1e9;
  for (const p of POIS) {
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < p.radius + extraR && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

export function poiById(id: string): Poi | undefined {
  return POIS.find((p) => p.id === id);
}

export function resolveBlockers(x: number, z: number): { x: number; z: number } {
  let ox = x;
  let oz = z;
  for (const b of BLOCKERS) {
    const dx = ox - b.x;
    const dz = oz - b.z;
    const d = Math.hypot(dx, dz) || 0.0001;
    if (d < b.r) {
      const k = b.r / d;
      ox = b.x + dx * k;
      oz = b.z + dz * k;
    }
  }
  return { x: ox, z: oz };
}

export function inWorld(x: number, z: number): boolean {
  const lim = WORLD * 0.48;
  return Math.abs(x) < lim && Math.abs(z) < lim;
}

export function clampWorld(x: number, z: number): { x: number; z: number } {
  const lim = WORLD * 0.47;
  return {
    x: Math.max(-lim, Math.min(lim, x)),
    z: Math.max(-lim, Math.min(lim, z)),
  };
}

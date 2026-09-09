export interface SkyFrame {
  zenith: string;
  horizon: string;
  fog: string;
  sun: string;
  hemiSky: string;
  hemiGround: string;
  sunIntensity: number;
  ambient: number;
  sunDir: [number, number, number];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}

const KEYS: { h: number; s: Omit<SkyFrame, "sunDir" | "sunIntensity" | "ambient"> & { sunI: number; amb: number } }[] = [
  { h: 0, s: { zenith: "#0c1220", horizon: "#1b2433", fog: "#141c28", sun: "#a8b4c8", hemiSky: "#1a2434", hemiGround: "#1a2218", sunI: 0.18, amb: 0.12 } },
  { h: 5.4, s: { zenith: "#2a3350", horizon: "#e0a888", fog: "#c48a78", sun: "#f0c8a0", hemiSky: "#d9a888", hemiGround: "#4a3a32", sunI: 0.45, amb: 0.18 } },
  { h: 7.2, s: { zenith: "#8ec4e0", horizon: "#f0ddd0", fog: "#d7e4dc", sun: "#fff2d8", hemiSky: "#e8f0ea", hemiGround: "#7a8a62", sunI: 1.05, amb: 0.28 } },
  { h: 12, s: { zenith: "#7eb7d8", horizon: "#e4efe8", fog: "#cfe0d6", sun: "#fff6e4", hemiSky: "#eef4ee", hemiGround: "#7d9468", sunI: 1.35, amb: 0.32 } },
  { h: 17.2, s: { zenith: "#6a8cb0", horizon: "#f0b898", fog: "#e0c4a8", sun: "#f0c090", hemiSky: "#f0d2b4", hemiGround: "#6a5a48", sunI: 0.95, amb: 0.24 } },
  { h: 19.2, s: { zenith: "#2c3658", horizon: "#c87878", fog: "#6a4858", sun: "#e09080", hemiSky: "#8a6070", hemiGround: "#2a2824", sunI: 0.4, amb: 0.14 } },
  { h: 21.5, s: { zenith: "#0e1524", horizon: "#1c2434", fog: "#121820", sun: "#c8d0dc", hemiSky: "#1a2230", hemiGround: "#161c16", sunI: 0.16, amb: 0.1 } },
  { h: 24, s: { zenith: "#0c1220", horizon: "#1b2433", fog: "#141c28", sun: "#a8b4c8", hemiSky: "#1a2434", hemiGround: "#1a2218", sunI: 0.18, amb: 0.12 } },
];

export function skyForHour(hour: number, weather: "clear" | "mist" | "overcast" | "rain"): SkyFrame {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1]!.h < h) i++;
  const a = KEYS[i]!;
  const b = KEYS[i + 1]!;
  const t = (h - a.h) / (b.h - a.h || 1);
  const mix = (k: keyof typeof a.s) => mixHex(String(a.s[k]), String(b.s[k]), t);
  let zenith = mix("zenith");
  let horizon = mix("horizon");
  let fog = mix("fog");
  let sunI = lerp(a.s.sunI, b.s.sunI, t);
  let amb = lerp(a.s.amb, b.s.amb, t);
  if (weather === "mist") {
    fog = mixHex(fog, "#c8d4cc", 0.45);
    sunI *= 0.7;
  } else if (weather === "overcast") {
    zenith = mixHex(zenith, "#8a9694", 0.4);
    fog = mixHex(fog, "#9aa6a0", 0.35);
    sunI *= 0.55;
  } else if (weather === "rain") {
    zenith = mixHex(zenith, "#5a686c", 0.5);
    horizon = mixHex(horizon, "#6a7874", 0.4);
    fog = mixHex(fog, "#6e7a78", 0.5);
    sunI *= 0.35;
    amb *= 0.85;
  }
  const ang = ((h - 6) / 12) * Math.PI;
  const sunDir: [number, number, number] = [
    Math.cos(ang) * 0.75,
    Math.max(0.08, Math.sin(ang)),
    Math.sin(ang * 0.4) * 0.35 - 0.4,
  ];
  return {
    zenith,
    horizon,
    fog,
    sun: mix("sun"),
    hemiSky: mix("hemiSky"),
    hemiGround: mix("hemiGround"),
    sunIntensity: sunI,
    ambient: amb,
    sunDir,
  };
}

export function isNight(hour: number): boolean {
  const h = ((hour % 24) + 24) % 24;
  return h < 5.8 || h > 19.6;
}

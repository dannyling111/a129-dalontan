import { runtime } from "./runtime";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: GainNode | null = null;
let wind: AudioBufferSourceNode | null = null;
let started = false;

function noiseBuffer(ac: AudioContext, seconds = 2): AudioBuffer {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC({ latencyHint: "interactive" });
  if (ctx.state === "suspended") void ctx.resume();
  if (started || !ctx) return;
  started = true;
  master = ctx.createGain();
  master.gain.value = runtime.muted ? 0 : 0.55;
  master.connect(ctx.destination);
  ambient = ctx.createGain();
  ambient.gain.value = 0.18;
  ambient.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 760;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 3);
  src.loop = true;
  src.connect(filter);
  filter.connect(ambient);
  src.start();
  wind = src;

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
}

function bus(): GainNode | null {
  if (!ctx || !master) return null;
  if (ctx.state === "suspended") void ctx.resume();
  return master;
}

export function setMuted(m: boolean) {
  runtime.muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.04);
}

export function playFoot() {
  const ac = ctx;
  const m = bus();
  if (!ac || !m) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(110 + Math.random() * 30, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(g);
  g.connect(m);
  o.start(t);
  o.stop(t + 0.1);
}

export function playChime() {
  const ac = ctx;
  const m = bus();
  if (!ac || !m) return;
  const t = ac.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.02 + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55 + i * 0.05);
    o.connect(g);
    g.connect(m);
    o.start(t + i * 0.04);
    o.stop(t + 0.7);
  });
}

export function playPlace() {
  const ac = ctx;
  const m = bus();
  if (!ac || !m) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(520, t + 0.12);
  g.gain.setValueAtTime(0.07, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g);
  g.connect(m);
  o.start(t);
  o.stop(t + 0.22);
}

export function tickAmbience() {
  if (!ctx || !ambient) return;
  const night = runtime.timeHours < 6 || runtime.timeHours > 20;
  const rain = runtime.weather === "rain";
  const target = rain ? 0.28 : night ? 0.12 : 0.18;
  ambient.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export { wind };

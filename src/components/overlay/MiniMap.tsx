import { useEffect, useRef } from "react";
import { LAKES, MOUNTAINS, POIS, START, WORLD } from "@/game/world";
import { runtime } from "@/game/runtime";

export function MiniMap({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const to = (x: number, z: number) => {
        const u = (x / WORLD + 0.5) * w;
        const v = (z / WORLD + 0.5) * h;
        return [u, v] as const;
      };
      ctx.fillStyle = "#e7dcc8";
      ctx.fillRect(0, 0, w, h);

      for (const l of LAKES) {
        const [cx, cy] = to(l.x, l.z);
        ctx.beginPath();
        ctx.ellipse(cx, cy, (l.rx / WORLD) * w, (l.rz / WORLD) * h, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#6aa3b0";
        ctx.fill();
      }

      for (const m of MOUNTAINS) {
        const [cx, cy] = to(m.x, m.z);
        const r = (m.r / WORLD) * w * 0.9;
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        g.addColorStop(0, "#8aa56a");
        g.addColorStop(1, "rgba(138,165,106,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#6e3432";
      for (const p of POIS) {
        if (p.kind === "peak" || p.kind === "flag") continue;
        const [u, v] = to(p.x, p.z);
        ctx.fillRect(u - 1.5, v - 1.5, 3, 3);
      }

      ctx.fillStyle = "#c45c5c";
      const [sx, sy] = to(START.x, START.z);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#2a3328";
      for (const vis of runtime.visitors) {
        const [u, v] = to(vis.x, vis.z);
        ctx.fillRect(u, v, 1.5, 1.5);
      }

      const p = runtime.player;
      const [px, pz] = to(p.x, p.z);
      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(p.yaw);
      ctx.fillStyle = "#2a3328";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(0, 3);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const size = compact ? 118 : 168;
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      className="block rounded-[10px]"
      style={{ width: size, height: size }}
      aria-label="Park map"
    />
  );
}

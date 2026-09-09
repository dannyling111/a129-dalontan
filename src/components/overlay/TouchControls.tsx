import { useRef, type PointerEvent } from "react";
import { runtime } from "@/game/runtime";

export function TouchControls() {
  const base = useRef<HTMLDivElement>(null);

  const onJoy = (e: PointerEvent) => {
    const el = base.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.42);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.42);
    const m = Math.hypot(nx, ny);
    const s = m > 1 ? 1 / m : 1;
    runtime.touch.x = nx * s;
    runtime.touch.y = -ny * s;
    const knob = el.querySelector("[data-knob]") as HTMLElement | null;
    if (knob) {
      knob.style.transform = `translate(calc(-50% + ${nx * s * 28}px), calc(-50% + ${ny * s * 28}px))`;
    }
  };

  const endJoy = () => {
    runtime.touch.x = 0;
    runtime.touch.y = 0;
    const el = base.current;
    const knob = el?.querySelector("[data-knob]") as HTMLElement | null;
    if (knob) knob.style.transform = "translate(-50%, -50%)";
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 md:hidden" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
      <div
        ref={base}
        className="joystick-base pointer-events-auto"
        onPointerDown={onJoy}
        onPointerMove={(e) => {
          if (e.buttons || e.pressure > 0) onJoy(e);
        }}
        onPointerUp={endJoy}
        onPointerCancel={endJoy}
      >
        <div data-knob className="joystick-knob" />
      </div>
      <button
        type="button"
        className="pointer-events-auto mb-3 grid size-16 place-items-center rounded-full border border-line-strong bg-paper/80 font-cjk text-lg text-ink"
        onPointerDown={() => {
          runtime.touch.interact = true;
          runtime.interactHeld = true;
        }}
        onPointerUp={() => {
          runtime.interactHeld = false;
        }}
        onPointerCancel={() => {
          runtime.interactHeld = false;
        }}
      >
        E
      </button>
    </div>
  );
}

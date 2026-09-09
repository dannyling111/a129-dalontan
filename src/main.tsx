import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import GameApp from "@/components/GameApp";
import "@/styles.css";

function Boot() {
  return (
    <main className="game-shell grid place-items-center bg-ink text-paper">
      <div className="w-[min(92vw,440px)] rounded-[28px] border border-line bg-paper px-7 py-8 text-ink shadow-paper">
        <p className="font-display text-[11px] tracking-[0.28em] uppercase text-ink-soft">
          Da Long Tan · park life
        </p>
        <h1 className="mt-2 font-cjk text-[42px] leading-[1.05]">大龙潭</h1>
        <p className="mt-1 font-display text-2xl tracking-[0.18em] text-sage">DALONTAN</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Walk the peaks, lake, and villages. A low-poly park-life sim.
        </p>
        <p className="mt-5 text-[12px] uppercase tracking-[0.16em] text-ink-faint">Loading the park</p>
      </div>
    </main>
  );
}

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <Boot />;
  return <GameApp />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

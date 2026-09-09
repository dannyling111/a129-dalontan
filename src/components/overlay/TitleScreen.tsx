import { Compass } from "lucide-react";
import { runtime } from "@/game/runtime";
import { unlockAudio, playChime } from "@/game/audio";
import { hasSave, loadGame, saveGame } from "@/game/save";
import { useHud } from "@/store/hud";

export function TitleScreen() {
  const enter = (resume: boolean) => {
    unlockAudio();
    playChime();
    if (resume) loadGame();
    runtime.phase = "playing";
    runtime.cam.yaw = runtime.player.yaw;
    saveGame();
    useHud.getState().pull();
  };

  const saved = typeof window !== "undefined" && hasSave();

  return (
    <div className="absolute inset-0 z-20 flex items-end md:items-center justify-center pointer-events-none">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
      <div className="pointer-events-auto relative mb-8 md:mb-0 w-[min(92vw,440px)] hud-panel rounded-[28px] px-7 py-7 md:px-9 md:py-8">
        <p className="title-enter font-display text-[11px] tracking-[0.28em] uppercase text-ink-soft">
          Da Long Tan · park life
        </p>
        <h1 className="title-enter mt-2 font-cjk text-[42px] leading-[1.05] text-ink md:text-[52px]" style={{ animationDelay: "60ms" }}>
          大龙潭
        </h1>
        <p className="title-enter mt-1 font-display text-2xl tracking-[0.18em] text-sage" style={{ animationDelay: "90ms" }}>
          DALONTAN
        </p>
        <p className="title-enter mt-3 max-w-[34ch] text-sm leading-relaxed text-ink-soft" style={{ animationDelay: "120ms" }}>
          Walk the peaks, lake, and villages. Visitors wander on their own. Tend the park, ride the fair, and keep harmony rising.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => enter(false)}
            className="h-12 rounded-[16px] bg-ink px-5 text-[15px] font-medium text-paper transition-transform duration-[var(--motion-fast)] hover:bg-sage-deep active:scale-[0.98]"
          >
            Enter the park · Start walking
          </button>
          {saved ? (
            <button
              type="button"
              onClick={() => enter(true)}
              className="h-12 rounded-[16px] border border-line-strong bg-paper px-5 text-[15px] font-medium text-ink transition-transform duration-[var(--motion-fast)] hover:bg-paper-2 active:scale-[0.98]"
            >
              Continue last walk
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-ink-faint">
          <Compass className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          <span>
            WASD to walk · drag to look · E to visit · M map · 1–4 place amenities · Esc pause
          </span>
        </div>
      </div>
    </div>
  );
}

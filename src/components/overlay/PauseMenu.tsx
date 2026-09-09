import { useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { runtime, resetRun } from "@/game/runtime";
import { setMuted } from "@/game/audio";
import { clearSave, saveGame } from "@/game/save";
import { useHud } from "@/store/hud";
import { MiniMap } from "./MiniMap";
import { POIS, QUESTS } from "@/game/world";

type Tab = "walk" | "ledger" | "atlas";

export function PauseMenu() {
  const hud = useHud();
  const [tab, setTab] = useState<Tab>("walk");

  const resume = () => {
    runtime.phase = "playing";
    saveGame();
    hud.pull();
  };

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-overlay p-3">
      <div className="hud-panel relative w-[min(96vw,560px)] max-h-[min(92dvh,720px)] overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <p className="font-cjk text-xl text-ink">大龙潭</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">Park ledger</p>
          </div>
          <button
            type="button"
            onClick={resume}
            className="grid size-10 place-items-center rounded-[12px] text-ink"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-3 flex gap-1 px-5">
          {(["walk", "ledger", "atlas"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`h-9 rounded-[12px] px-3 text-[13px] font-medium ${
                tab === t ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2"
              }`}
            >
              {t === "walk" ? "Walk" : t === "ledger" ? "Ledger" : "Atlas"}
            </button>
          ))}
        </div>

        <div className="max-h-[58dvh] overflow-y-auto px-5 py-4">
          {tab === "walk" ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-ink-soft">
                Third-person stroll. WASD relative to the camera. E visits a place. Drag looks. Scroll zooms. M tilts into a plan view.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Stat k="Harmony" v={`${hud.harmony}`} />
                <Stat k="Tokens" v={`${hud.coins}`} />
                <Stat k="Visitors" v={`${hud.visitors}`} />
                <Stat k="Stars" v={`${hud.stars} / 5`} />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={resume}
                  className="h-11 flex-1 rounded-[14px] bg-ink text-sm font-medium text-paper"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMuted(!runtime.muted);
                    hud.pull();
                  }}
                  className="grid size-11 place-items-center rounded-[14px] border border-line text-ink"
                  aria-label="Mute"
                >
                  {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearSave();
                  resetRun();
                  runtime.phase = "playing";
                  hud.pull();
                }}
                className="h-10 w-full rounded-[14px] text-[13px] text-ink-soft hover:bg-paper-2"
              >
                New park
              </button>
            </div>
          ) : null}

          {tab === "ledger" ? (
            <div className="space-y-4">
              <Bars />
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-ink-faint">Diary</p>
                <ul className="space-y-1.5">
                  {QUESTS.map((q) => {
                    const done = hud.questDone.includes(q.id);
                    const have = hud.quests[q.id] ?? 0;
                    return (
                      <li key={q.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={done ? "text-sage" : "text-ink"}>
                          {q.title}
                          <span className="ml-2 text-[11px] text-ink-faint">{q.titleEn}</span>
                        </span>
                        <span className="tabular text-[12px] text-ink-soft">
                          {done ? "done" : `${have}/${q.need}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <MiniMap />
              </div>
              <ul className="columns-2 gap-x-4 text-[12px] text-ink-soft">
                {POIS.filter((p) => p.kind !== "flag").map((p) => (
                  <li key={p.id} className="mb-1 break-inside-avoid">
                    <span className="text-ink">{p.name}</span> {p.nameEn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[16px] bg-paper-2 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</p>
      <p className="font-display text-lg tabular text-ink">{v}</p>
    </div>
  );
}

function Bars() {
  const hud = useHud();
  const hist = runtime.history;
  const max = Math.max(8, ...hist.map((h) => h.visitors));
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-ink-faint">Visitor flow</p>
      <div className="flex h-16 items-end gap-0.5">
        {(hist.length ? hist : [{ visitors: hud.visitors, harmony: hud.harmony, t: 0 }]).map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[3px] bg-sage"
            style={{ height: `${(h.visitors / max) * 100}%`, opacity: 0.45 + (h.harmony / 100) * 0.55 }}
          />
        ))}
      </div>
    </div>
  );
}

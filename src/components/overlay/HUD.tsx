import {
  Armchair,
  Clock,
  Cloud,
  CloudRain,
  Coins,
  Flower2,
  Lamp,
  Map as MapIcon,
  Pause,
  Star,
  Store,
  Users,
} from "lucide-react";
import { runtime } from "@/game/runtime";
import { useHud } from "@/store/hud";
import { MiniMap } from "./MiniMap";
import { AMENITIES } from "@/game/world";
import { saveGame } from "@/game/save";

const WEATHER: Record<string, string> = {
  clear: "Clear",
  mist: "Mist",
  overcast: "Overcast",
  rain: "Rain",
};

function Need({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>{label}</span>
        <span className="tabular">{Math.round(value)}</span>
      </div>
      <div className="need-bar">
        <span style={{ width: `${Math.max(4, value)}%` }} />
      </div>
    </div>
  );
}

export function HUD() {
  const hud = useHud();

  const pause = () => {
    runtime.phase = "paused";
    saveGame();
    hud.pull();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-3 md:p-4" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto hud-panel flex items-center gap-3 rounded-[20px] px-3.5 py-2.5">
          <Clock className="size-3.5 text-sage" strokeWidth={1.75} />
          <div>
            <p className="font-display text-sm tabular leading-none text-ink">{hud.clock}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Day {hud.day} · {WEATHER[hud.weather] ?? hud.weather}
            </p>
          </div>
          {hud.weather === "rain" ? (
            <CloudRain className="size-3.5 text-lake" strokeWidth={1.75} />
          ) : (
            <Cloud className="size-3.5 text-ink-faint" strokeWidth={1.75} />
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hud-panel hidden items-center gap-3 rounded-[20px] px-3.5 py-2.5 sm:flex">
            <Users className="size-3.5 text-sage" strokeWidth={1.75} />
            <span className="tabular text-sm text-ink">{hud.visitors}</span>
            <Coins className="size-3.5 text-sage" strokeWidth={1.75} />
            <span className="tabular text-sm text-ink">{hud.coins}</span>
            <Star className="size-3.5 text-sage" strokeWidth={1.75} />
            <span className="tabular text-sm text-ink">{hud.stars}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              runtime.cam.mapView = !runtime.cam.mapView;
              hud.pull();
            }}
            className="hud-panel grid size-11 place-items-center rounded-[16px] text-ink"
            aria-label="Toggle map camera"
          >
            <MapIcon className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={pause}
            className="hud-panel grid size-11 place-items-center rounded-[16px] text-ink"
            aria-label="Pause"
          >
            <Pause className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-20 hidden w-[180px] md:block">
        <div className="pointer-events-auto hud-panel space-y-2.5 rounded-[20px] px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Quant engine</p>
          <Meter label="Harmony" value={hud.harmony} />
          <Meter label="Clean" value={hud.cleanliness} />
          <Meter label="Nature" value={hud.nature} />
          <p className="pt-1 text-[11px] text-ink-soft">
            Diary {hud.diaryDone}/{hud.diaryTotal}
          </p>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 md:bottom-4 md:left-4 md:right-4">
        <div className="pointer-events-auto hud-panel hidden w-[200px] space-y-2 rounded-[20px] px-3.5 py-3 sm:block">
          <Need label="Hunger" value={hud.needs.hunger} />
          <Need label="Fun" value={hud.needs.fun} />
          <Need label="Rest" value={hud.needs.rest} />
          <Need label="Wonder" value={hud.needs.wonder} />
          <Need label="Social" value={hud.needs.social} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 pb-16 sm:pb-0">
          {hud.activity ? (
            <div className="hud-panel w-[min(80vw,280px)] rounded-[16px] px-4 py-2">
              <p className="text-center font-cjk text-sm text-ink">{hud.activity.label}</p>
              <div className="need-bar mt-1.5">
                <span style={{ width: `${(hud.activity.t / hud.activity.dur) * 100}%` }} />
              </div>
            </div>
          ) : hud.prompt ? (
            <div className="hud-panel rounded-[16px] px-4 py-2 text-center text-[13px] text-ink">{hud.prompt}</div>
          ) : null}
          {hud.toast ? (
            <div className="hud-panel rounded-[16px] px-4 py-1.5 text-[12px] text-ink-soft">{hud.toast}</div>
          ) : null}
          <div className="pointer-events-auto flex gap-1.5">
            {AMENITIES.map((a, i) => {
              const on = hud.build === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    runtime.build = on ? null : a.id;
                    hud.pull();
                  }}
                  className={`grid size-10 place-items-center rounded-[12px] border text-ink ${
                    on ? "border-sage bg-sage text-paper" : "border-line bg-paper/80"
                  }`}
                  aria-label={a.nameEn}
                  title={`${i + 1} · ${a.nameEn} · ${a.cost}`}
                >
                  {a.id === "flowers" ? (
                    <Flower2 className="size-4" strokeWidth={1.75} />
                  ) : a.id === "bench" ? (
                    <Armchair className="size-4" strokeWidth={1.75} />
                  ) : a.id === "lantern" ? (
                    <Lamp className="size-4" strokeWidth={1.75} />
                  ) : (
                    <Store className="size-4" strokeWidth={1.75} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-auto hidden hud-panel rounded-[20px] p-2 md:block">
          <MiniMap />
        </div>
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>{label}</span>
        <span className="tabular text-ink">{value}</span>
      </div>
      <div className="need-bar">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ParkWorld } from "@/game/scene/ParkWorld";
import { attachInput, installControlsProbe, runtime } from "@/game/runtime";
import { resumeAudio } from "@/game/audio";
import { saveGame } from "@/game/save";
import { useHud } from "@/store/hud";
import { TitleScreen } from "./overlay/TitleScreen";
import { HUD } from "./overlay/HUD";
import { PauseMenu } from "./overlay/PauseMenu";
import { TouchControls } from "./overlay/TouchControls";

export default function GameApp() {
  const phase = useHud((s) => s.phase);

  useEffect(() => {
    installControlsProbe();
    const off = attachInput(window);
    const id = window.setInterval(() => useHud.getState().pull(), 120);
    const vis = () => {
      resumeAudio();
      if (document.hidden) saveGame();
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", saveGame);
    return () => {
      off();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pagehide", saveGame);
    };
  }, []);

  return (
    <div className="game-shell">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ fov: 48, near: 0.15, far: 260, position: [38, 16, 42] }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
          gl.setClearColor("#cfe0d6", 1);
          runtime.ready = true;
        }}
      >
        <ParkWorld />
      </Canvas>
      {phase === "title" ? <TitleScreen /> : null}
      {phase === "playing" ? (
        <>
          <HUD />
          <TouchControls />
        </>
      ) : null}
      {phase === "paused" ? <PauseMenu /> : null}
    </div>
  );
}

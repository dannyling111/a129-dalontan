import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { runtime, bumpFoot, stepGame } from "../runtime";
import { playFoot, tickAmbience } from "../audio";
import { Atmosphere, Fireflies, Petals, Rain, Terrain, Water } from "./landscape";
import { Flowers, Rocks, Trees } from "./flora";
import { Structures } from "./structures";
import { PlayerActor, Visitors } from "./actors";

const _cam = new THREE.Vector3();
const _look = new THREE.Vector3();

function Rig() {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (runtime.phase !== "playing") return;
      if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
      dragging.current = true;
      last.current.x = e.clientX;
      last.current.y = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current || runtime.phase !== "playing") return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current.x = e.clientX;
      last.current.y = e.clientY;
      runtime.cam.yaw -= dx * 0.005;
      runtime.cam.pitch = Math.max(-0.08, Math.min(0.72, runtime.cam.pitch + dy * 0.0035));
    };
    const up = () => {
      dragging.current = false;
    };
    const wheel = (e: WheelEvent) => {
      if (runtime.phase !== "playing") return;
      runtime.cam.dist = Math.max(5.2, Math.min(22, runtime.cam.dist + e.deltaY * 0.01));
    };
    const ctx = (e: Event) => e.preventDefault();
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: true });
    el.addEventListener("contextmenu", ctx);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", ctx);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    stepGame(d);
    if (bumpFoot(d)) playFoot();
    tickAmbience();

    if (runtime.phase === "title") {
      const t = runtime.cam.titleT;
      const r = 46;
      camera.position.set(Math.sin(t * 0.065) * r, 15.5 + Math.sin(t * 0.04) * 2.5, Math.cos(t * 0.065) * r - 6);
      camera.lookAt(4, 2.6, 12);
      return;
    }

    const p = runtime.player;
    if (runtime.cam.mapView) {
      _cam.set(p.x, 62, p.z + 10);
      camera.position.lerp(_cam, 1 - Math.exp(-d * 3.2));
      camera.lookAt(p.x, 0.2, p.z);
      return;
    }

    const yaw = runtime.cam.yaw;
    const pitch = runtime.cam.pitch;
    const dist = runtime.cam.dist;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const cp = Math.cos(pitch);
    _cam.set(p.x - fx * dist * cp, p.y + 1.55 + dist * Math.sin(pitch), p.z - fz * dist * cp);
    camera.position.lerp(_cam, 1 - Math.exp(-d * 7.5));
    _look.set(p.x, p.y + 1.28, p.z);
    camera.lookAt(_look);
  });

  return null;
}

function Birds() {
  const ref = useRef<THREE.Group>(null);
  const flock = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        r: 10 + i * 1.4,
        y: 9 + (i % 3) * 1.2,
        s: 0.18 + (i % 3) * 0.04,
        ph: i * 0.7,
      })),
    [],
  );
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.15;
  });
  return (
    <group ref={ref} position={[6, 0, 8]}>
      {flock.map((b, i) => (
        <mesh key={i} position={[b.r, b.y, 0]} scale={[b.s * 1.6, b.s * 0.25, b.s]}>
          <boxGeometry />
          <meshLambertMaterial color="#2a3328" />
        </mesh>
      ))}
    </group>
  );
}

export function ParkWorld() {
  return (
    <>
      <Rig />
      <Atmosphere />
      <Terrain />
      <Water />
      <Trees />
      <Rocks />
      <Flowers />
      <Structures />
      <PlayerActor />
      <Visitors />
      <Petals />
      <Fireflies />
      <Rain />
      <Birds />
    </>
  );
}

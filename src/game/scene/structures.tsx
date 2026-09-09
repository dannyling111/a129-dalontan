import { type ComponentProps, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { POIS, START, surfaceHeight } from "../world";
import { runtime } from "../runtime";
import { isNight } from "../sky";

function Wood({ color = "#6b4a32", ...props }: { color?: string } & ComponentProps<"mesh">) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

function Roof({ color = "#6e3432", ...props }: { color?: string } & ComponentProps<"mesh">) {
  return (
    <mesh castShadow {...props}>
      <coneGeometry args={[1, 1, 4]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

export function StiltHouse({
  x,
  z,
  rot = 0,
  roof = "#6e3432",
  w = 2.1,
  d = 1.7,
  wall = "#efe6d4",
}: {
  x: number;
  z: number;
  rot?: number;
  roof?: string;
  w?: number;
  d?: number;
  wall?: string;
}) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <Wood color="#5a3a28" position={[-0.8, 0.5, -0.6]} scale={[0.12, 1, 0.12]} />
      <Wood color="#5a3a28" position={[0.8, 0.5, -0.6]} scale={[0.12, 1, 0.12]} />
      <Wood color="#5a3a28" position={[-0.8, 0.5, 0.6]} scale={[0.12, 1, 0.12]} />
      <Wood color="#5a3a28" position={[0.8, 0.5, 0.6]} scale={[0.12, 1, 0.12]} />
      <Wood color={wall} position={[0, 1.35, 0]} scale={[w, 1.15, d]} />
      <Wood color="#cbb89a" position={[0, 0.78, 0]} scale={[w + 0.15, 0.1, d + 0.15]} />
      <Roof color={roof} position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w * 0.95, 1.05, d * 0.95]} />
    </group>
  );
}

function Paifang({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <Wood color="#5c3428" position={[-1.6, 1.4, 0]} scale={[0.28, 2.8, 0.28]} />
      <Wood color="#5c3428" position={[1.6, 1.4, 0]} scale={[0.28, 2.8, 0.28]} />
      <Wood color="#6e3432" position={[0, 2.85, 0]} scale={[4.1, 0.28, 0.55]} />
      <Wood color="#8a4038" position={[0, 3.25, 0]} scale={[4.4, 0.18, 0.7]} />
      <Wood color="#efe6d4" position={[0, 2.35, 0]} scale={[2.2, 0.45, 0.12]} />
    </group>
  );
}

function Pagoda({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  const tiers = [
    { w: 3.4, h: 1.15, y: 0.7 },
    { w: 2.7, h: 1.05, y: 1.95 },
    { w: 2.05, h: 0.95, y: 3.1 },
    { w: 1.4, h: 0.85, y: 4.15 },
  ];
  return (
    <group position={[x, y, z]}>
      {tiers.map((t, i) => (
        <group key={i} position={[0, t.y, 0]}>
          <Wood color="#efe6d4" scale={[t.w, t.h, t.w]} />
          <Roof
            color="#6e3432"
            position={[0, t.h * 0.58, 0]}
            rotation={[0, Math.PI / 4, 0]}
            scale={[t.w * 0.82, 0.52, t.w * 0.82]}
          />
        </group>
      ))}
      <mesh position={[0, 5.35, 0]}>
        <sphereGeometry args={[0.16, 6, 4]} />
        <meshLambertMaterial color="#c2a36b" emissive="#6a5020" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function CoveredBridge() {
  const x0 = 19.5;
  const x1 = 35.5;
  const z = 16;
  const mid = (x0 + x1) / 2;
  const len = x1 - x0;
  const y = 2.15;
  const posts = [20, 23, 26, 29, 32, 35];
  return (
    <group>
      <Wood color="#8a623c" position={[mid, y, z]} scale={[len, 0.18, 2.5]} />
      <Wood color="#6e3432" position={[mid, y + 1.95, z]} scale={[len + 0.4, 0.14, 3.3]} />
      <Wood color="#efe6d4" position={[mid, y + 1.15, z - 1.15]} scale={[len, 1.5, 0.1]} />
      <Wood color="#efe6d4" position={[mid, y + 1.15, z + 1.15]} scale={[len, 1.5, 0.1]} />
      {posts.map((px) => (
        <group key={px}>
          <Wood color="#5a3a28" position={[px, 1.05, z - 1.1]} scale={[0.16, 2.1, 0.16]} />
          <Wood color="#5a3a28" position={[px, 1.05, z + 1.1]} scale={[0.16, 2.1, 0.16]} />
        </group>
      ))}
      <StiltHouse x={x0 - 0.2} z={z} rot={0} w={2.4} d={2.6} roof="#6e3432" />
      <StiltHouse x={x1 + 0.2} z={z} rot={0} w={2.4} d={2.6} roof="#6e3432" />
    </group>
  );
}

function Flag({ x, z, color = "#c45c5c" }: { x: number; z: number; color?: string }) {
  const y = surfaceHeight(x, z);
  const cloth = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(s.clock.elapsedTime * 2.2) * 0.25;
  });
  return (
    <group position={[x, y, z]}>
      <Wood color="#5a3a28" position={[0, 1.5, 0]} scale={[0.08, 3, 0.08]} />
      <mesh ref={cloth} position={[0.45, 2.55, 0]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshLambertMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Carousel({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  const y = surfaceHeight(x, z);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.55;
  });
  const horses = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group position={[x, y, z]}>
      <Wood color="#efe6d4" position={[0, 0.15, 0]} scale={[4.4, 0.16, 4.4]} />
      <Wood color="#8a4038" position={[0, 1.6, 0]} scale={[0.18, 3.2, 0.18]} />
      <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.6, 1.1, 8]} />
        <meshLambertMaterial color="#c45c5c" />
      </mesh>
      <group ref={ref}>
        {horses.map((a, i) => (
          <group key={i} position={[Math.cos(a) * 1.7, 0.85, Math.sin(a) * 1.7]}>
            <Wood color="#5a3a28" position={[0, 0.4, 0]} scale={[0.07, 1.1, 0.07]} />
            <mesh position={[0, 0.15, 0]} scale={[0.42, 0.28, 0.18]}>
              <boxGeometry />
              <meshLambertMaterial color={i % 2 ? "#efe6d4" : "#c98990"} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Ferris({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  const y = surfaceHeight(x, z);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.22;
  });
  const cabins = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group position={[x, y, z]} rotation={[0, 0.5, 0]}>
      <Wood color="#6d6258" position={[-0.45, 3.1, 0]} rotation={[0, 0, 0.22]} scale={[0.16, 6.4, 0.16]} />
      <Wood color="#6d6258" position={[0.45, 3.1, 0]} rotation={[0, 0, -0.22]} scale={[0.16, 6.4, 0.16]} />
      <group ref={ref} position={[0, 6.1, 0]}>
        <mesh>
          <torusGeometry args={[3.8, 0.07, 6, 24]} />
          <meshLambertMaterial color="#c45c5c" />
        </mesh>
        {cabins.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 3.8, Math.sin(a) * 3.8, 0]}>
            <boxGeometry args={[0.5, 0.46, 0.4]} />
            <meshLambertMaterial color={i % 2 ? "#efe6d4" : "#d97b7b"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Stall({ x, z, rot = 0, color = "#c45c5c" }: { x: number; z: number; rot?: number; color?: string }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <Wood color="#efe6d4" position={[0, 0.55, 0]} scale={[1.6, 0.9, 1.1]} />
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.15, 0.7, 4]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  );
}

function Pavilion({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <Wood color="#5a3a28" position={[-1.1, 1.1, -1.1]} scale={[0.14, 2.2, 0.14]} />
      <Wood color="#5a3a28" position={[1.1, 1.1, -1.1]} scale={[0.14, 2.2, 0.14]} />
      <Wood color="#5a3a28" position={[-1.1, 1.1, 1.1]} scale={[0.14, 2.2, 0.14]} />
      <Wood color="#5a3a28" position={[1.1, 1.1, 1.1]} scale={[0.14, 2.2, 0.14]} />
      <Roof color="#4a6d7c" position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.2, 1.1, 2.2]} />
      <Wood color="#cbb89a" position={[0, 1.15, 0]} scale={[1.4, 0.12, 1.4]} />
    </group>
  );
}

function Restaurant({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <Wood color="#efe6d4" position={[0, 1.2, 0]} scale={[4.2, 1.8, 3.2]} />
      <Roof color="#6e3432" position={[0, 2.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[3.6, 1.4, 2.8]} />
      <Wood color="#5a3a28" position={[0, 0.7, 1.7]} scale={[1.4, 1.2, 0.12]} />
      <mesh position={[0, 2.95, 0]}>
        <boxGeometry args={[0.8, 0.35, 0.12]} />
        <meshLambertMaterial color="#4f6f56" />
      </mesh>
    </group>
  );
}

function Ruins({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[-1.1, 0.7, 0.2]} scale={[0.45, 1.4, 0.45]} rotation={[0.1, 0.2, 0.05]}>
        <boxGeometry />
        <meshLambertMaterial color="#b7b09e" flatShading />
      </mesh>
      <mesh position={[0.9, 0.45, -0.4]} scale={[0.55, 0.9, 0.5]} rotation={[-0.08, 0.4, 0]}>
        <boxGeometry />
        <meshLambertMaterial color="#c4bda8" flatShading />
      </mesh>
      <mesh position={[0.1, 0.2, 0.8]} scale={[1.8, 0.28, 1.1]}>
        <boxGeometry />
        <meshLambertMaterial color="#a8a090" />
      </mesh>
    </group>
  );
}

function Dock({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <Wood color="#8a623c" position={[x, 0.38, z]} scale={[4.4, 0.14, 1.8]} />
      <Wood color="#5a3a28" position={[x - 1.8, 0.1, z - 0.7]} scale={[0.12, 0.7, 0.12]} />
      <Wood color="#5a3a28" position={[x + 1.8, 0.1, z - 0.7]} scale={[0.12, 0.7, 0.12]} />
      <Wood color="#5a3a28" position={[x - 1.8, 0.1, z + 0.7]} scale={[0.12, 0.7, 0.12]} />
      <Wood color="#5a3a28" position={[x + 1.8, 0.1, z + 0.7]} scale={[0.12, 0.7, 0.12]} />
    </group>
  );
}

function Boat({ x, z, phase = 0 }: { x: number; z: number; phase?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime + phase;
    ref.current.position.y = 0.12 + Math.sin(t * 1.4) * 0.08;
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.06;
    ref.current.position.x = x + Math.sin(t * 0.12) * 1.2;
  });
  return (
    <group ref={ref} position={[x, 0.12, z]}>
      <mesh scale={[1.6, 0.28, 0.7]}>
        <boxGeometry />
        <meshLambertMaterial color="#6b4a32" />
      </mesh>
      <mesh position={[0, 0.55, 0]} scale={[0.06, 1.1, 0.06]}>
        <boxGeometry />
        <meshLambertMaterial color="#efe6d4" />
      </mesh>
    </group>
  );
}

function Windmill({ x, z }: { x: number; z: number }) {
  const blades = useRef<THREE.Group>(null);
  const y = surfaceHeight(x, z);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.7;
  });
  return (
    <group position={[x, y, z]}>
      <Wood color="#efe6d4" position={[0, 2.2, 0]} scale={[1.4, 4.2, 1.4]} />
      <Roof color="#6e3432" position={[0, 4.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.3, 1.1, 1.3]} />
      <group ref={blades} position={[0, 3.6, 0.8]}>
        {[0, 1, 2, 3].map((i) => (
          <Wood key={i} color="#dccdb4" rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 1.1, 0]} scale={[0.22, 2.2, 0.08]} />
        ))}
      </group>
    </group>
  );
}

function Spring({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  const steam = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((s) => {
    if (!steam.current) return;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < 12; i++) {
      dummy.position.set(Math.sin(i * 1.7) * 0.8, 0.4 + ((t * 0.4 + i * 0.3) % 2.2), Math.cos(i * 1.3) * 0.8);
      dummy.scale.setScalar(0.15 + ((t + i) % 1) * 0.2);
      dummy.updateMatrix();
      steam.current.setMatrixAt(i, dummy.matrix);
    }
    steam.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <circleGeometry args={[2.1, 16]} />
        <meshLambertMaterial color="#8fb7a4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <circleGeometry args={[1.4, 16]} />
        <meshLambertMaterial color="#6aa0b0" transparent opacity={0.85} />
      </mesh>
      <instancedMesh ref={steam} args={[undefined, undefined, 12]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshLambertMaterial color="#f4f1ea" transparent opacity={0.35} />
      </instancedMesh>
    </group>
  );
}

function KoiPond({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  const fish = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (fish.current) fish.current.rotation.y = s.clock.elapsedTime * 0.4;
  });
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[1.6, 2.2, 20]} />
        <meshLambertMaterial color="#8d8a80" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[1.6, 16]} />
        <meshLambertMaterial color="#4a8a92" transparent opacity={0.8} />
      </mesh>
      <group ref={fish} position={[0, 0.16, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i) * 0.8, 0, Math.sin(i) * 0.8]} scale={[0.28, 0.08, 0.12]}>
            <boxGeometry />
            <meshLambertMaterial color={i % 2 ? "#c45c5c" : "#f0ead8"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Swings({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  const seat = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (seat.current) seat.current.rotation.x = Math.sin(s.clock.elapsedTime * 1.5) * 0.35;
  });
  return (
    <group position={[x, y, z]}>
      <Wood color="#5a3a28" position={[-1.2, 1.1, 0]} scale={[0.12, 2.2, 0.12]} />
      <Wood color="#5a3a28" position={[1.2, 1.1, 0]} scale={[0.12, 2.2, 0.12]} />
      <Wood color="#5a3a28" position={[0, 2.2, 0]} scale={[2.6, 0.12, 0.12]} />
      <group ref={seat} position={[0, 2.15, 0]}>
        <Wood color="#8a623c" position={[0, -1.15, 0]} scale={[0.9, 0.08, 0.35]} />
      </group>
    </group>
  );
}

function Tent({ x, z, rot = 0, color = "#4f6f56" }: { x: number; z: number; rot?: number; color?: string }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.3, 1.7, 4]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  );
}

function LanternPost({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = isNight(runtime.timeHours) ? 0.9 : 0.08;
  });
  return (
    <group position={[x, y, z]}>
      <Wood color="#5a3a28" position={[0, 0.7, 0]} scale={[0.08, 1.4, 0.08]} />
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.32]} />
        <meshLambertMaterial ref={mat} color="#f0d9a0" emissive="#f0d9a0" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function PhotoFrame({ x, z }: { x: number; z: number }) {
  const y = surfaceHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <Wood color="#5a3a28" position={[0, 1.3, 0]} scale={[1.8, 1.2, 0.1]} />
      <Wood color="#efe6d4" position={[0, 1.3, 0.04]} scale={[1.4, 0.85, 0.04]} />
    </group>
  );
}

function PlacedItems() {
  const matRefs = useRef<(THREE.MeshLambertMaterial | null)[]>([]);
  useFrame(() => {
    const night = isNight(runtime.timeHours);
    for (const m of matRefs.current) {
      if (m) m.emissiveIntensity = night ? 0.8 : 0.1;
    }
  });
  return (
    <group>
      {runtime.placed.map((p, idx) => {
        const y = surfaceHeight(p.x, p.z);
        if (p.kind === "bench") {
          return (
            <group key={p.id} position={[p.x, y, p.z]} rotation={[0, p.yaw, 0]}>
              <Wood color="#8a623c" position={[0, 0.32, 0]} scale={[1.4, 0.1, 0.4]} />
              <Wood color="#5a3a28" position={[-0.6, 0.16, 0]} scale={[0.1, 0.32, 0.35]} />
              <Wood color="#5a3a28" position={[0.6, 0.16, 0]} scale={[0.1, 0.32, 0.35]} />
            </group>
          );
        }
        if (p.kind === "lantern") {
          return (
            <group key={p.id} position={[p.x, y, p.z]}>
              <Wood color="#5a3a28" position={[0, 0.5, 0]} scale={[0.08, 1, 0.08]} />
              <mesh position={[0, 1.15, 0]}>
                <boxGeometry args={[0.28, 0.34, 0.28]} />
                <meshLambertMaterial
                  ref={(el) => {
                    matRefs.current[idx] = el;
                  }}
                  color="#f0d9a0"
                  emissive="#f0d9a0"
                  emissiveIntensity={0.1}
                />
              </mesh>
            </group>
          );
        }
        if (p.kind === "flowers") {
          return (
            <group key={p.id} position={[p.x, y, p.z]}>
              <mesh position={[0, 0.08, 0]} scale={[1.2, 0.12, 0.8]}>
                <boxGeometry />
                <meshLambertMaterial color="#6b4a32" />
              </mesh>
              <mesh position={[0, 0.28, 0]}>
                <icosahedronGeometry args={[0.28, 0]} />
                <meshLambertMaterial color="#d97b7b" />
              </mesh>
            </group>
          );
        }
        return <Stall key={p.id} x={p.x} z={p.z} rot={p.yaw} color="#4f6f56" />;
      })}
    </group>
  );
}

function Litter() {
  return (
    <group>
      {runtime.litter.map((l) => (
        <mesh key={l.id} position={[l.x, surfaceHeight(l.x, l.z) + 0.06, l.z]} scale={[0.22, 0.06, 0.16]}>
          <boxGeometry />
          <meshLambertMaterial color="#dccdb4" />
        </mesh>
      ))}
    </group>
  );
}

export function Structures() {
  return (
    <group>
      <StaticPark />
      <LiveDecor />
    </group>
  );
}

function LiveDecor() {
  const [tick, setTick] = useState(0);
  const last = useRef(0);
  useFrame((s) => {
    const k = Math.floor(s.clock.elapsedTime * 4);
    if (k !== last.current) {
      last.current = k;
      setTick(k);
    }
  });
  return (
    <group>
      <PlacedItems />
      <Litter />
    </group>
  );
}

function StaticPark() {
  return (
    <group>
      <Paifang x={-46} z={-6} rot={Math.PI / 2} />
      <Paifang x={61} z={-34} rot={0.3} />
      <Flag x={START.x} z={START.z} />
      <Flag x={-36} z={-34} />
      <Pagoda x={34} z={8} />
      <CoveredBridge />
      <Restaurant x={-58} z={-3} />
      <Pavilion x={-16} z={-2} />
      <Pavilion x={54} z={30} />
      <StiltHouse x={-34} z={6} rot={0.4} wall="#e7dcc8" />
      <StiltHouse x={-22} z={28} rot={-0.3} w={2.6} d={2.2} roof="#4a6d7c" />
      <StiltHouse x={46} z={-30} rot={0.5} w={2.8} d={2.2} roof="#4a6d7c" />
      <StiltHouse x={4} z={-51} rot={0.2} />
      <StiltHouse x={6.2} z={-49} rot={-0.4} roof="#4a6d7c" />
      <StiltHouse x={1.6} z={-48.5} rot={0.7} />
      <StiltHouse x={24} z={-44} rot={0.1} />
      <StiltHouse x={26.4} z={-42.4} rot={-0.5} roof="#8a5a3a" />
      <StiltHouse x={22} z={-42} rot={0.8} />
      <StiltHouse x={38} z={-18} rot={0.3} w={2.4} />
      <StiltHouse x={40.2} z={-16.5} rot={-0.2} roof="#4a6d7c" />
      <StiltHouse x={36.2} z={-16.8} rot={0.9} />
      <Carousel x={5.2} z={39} />
      <Ferris x={9.4} z={41.5} />
      <Stall x={3.2} z={36.4} rot={0.3} />
      <Stall x={8.4} z={36.2} rot={-0.4} color="#4f6f56" />
      <Stall x={-4.8} z={8.2} rot={0.2} color="#c98990" />
      <Stall x={-7.4} z={7.2} rot={-0.3} color="#4a6d7c" />
      <Ruins x={8} z={58} />
      <Ruins x={26} z={38} />
      <Dock x={10} z={16} />
      <Boat x={8} z={20} phase={0} />
      <Boat x={-4} z={24} phase={2} />
      <Boat x={16} z={22} phase={4} />
      <Windmill x={58} z={8} />
      <Spring x={-52} z={28} />
      <KoiPond x={18} z={-6} />
      <Swings x={-20} z={12} />
      <Tent x={12} z={-28} />
      <Tent x={13.8} z={-26.6} rot={0.6} color="#c45c5c" />
      <PhotoFrame x={2} z={-12} />
      <LanternPost x={-8} z={7} />
      <LanternPost x={-4} z={9} />
      <LanternPost x={26} z={16} />
      <LanternPost x={32} z={16} />
      <LanternPost x={-16} z={-4} />
      <LanternPost x={-46} z={-8} />
      <LanternPost x={5} z={37} />
      {POIS.filter((p) => p.kind === "peak").map((p) => (
        <mesh key={p.id} position={[p.x, surfaceHeight(p.x, p.z) + 0.15, p.z]}>
          <cylinderGeometry args={[0.55, 0.7, 0.3, 6]} />
          <meshLambertMaterial color="#d9d4c6" />
        </mesh>
      ))}
    </group>
  );
}

export { LanternPost };

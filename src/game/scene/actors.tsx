import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { runtime } from "../runtime";

export function Person({
  color = "#4f6f56",
  isPlayer = false,
}: {
  color?: string;
  isPlayer?: boolean;
}) {
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);

  useFrame((s) => {
    const sp = isPlayer ? runtime.player.speed : 2.2;
    const walk = Math.min(1, sp / 5);
    const t = s.clock.elapsedTime * (6 + walk * 4);
    const swing = Math.sin(t) * 0.55 * walk;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing * 0.8;
    if (rightLeg.current) rightLeg.current.rotation.x = swing * 0.8;
    if (body.current) body.current.position.y = Math.abs(Math.sin(t)) * 0.05 * walk;
  });

  return (
    <group ref={body}>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshLambertMaterial color="#f0d8c0" />
      </mesh>
      {isPlayer ? (
        <mesh position={[0.22, 1.18, 0.02]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.16, 0.08, 0.22]} />
          <meshLambertMaterial color="#3a4038" />
        </mesh>
      ) : null}
      <mesh position={[0, 0.68, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.34, 3, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh ref={leftArm} position={[-0.26, 0.78, 0]}>
        <capsuleGeometry args={[0.06, 0.28, 3, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh ref={rightArm} position={[0.26, 0.78, 0]}>
        <capsuleGeometry args={[0.06, 0.28, 3, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh ref={leftLeg} position={[-0.1, 0.28, 0]}>
        <capsuleGeometry args={[0.07, 0.28, 3, 6]} />
        <meshLambertMaterial color="#3a4038" />
      </mesh>
      <mesh ref={rightLeg} position={[0.1, 0.28, 0]}>
        <capsuleGeometry args={[0.07, 0.28, 3, 6]} />
        <meshLambertMaterial color="#3a4038" />
      </mesh>
      {isPlayer ? (
        <mesh position={[0, 0.72, -0.22]} scale={[0.28, 0.32, 0.12]}>
          <boxGeometry />
          <meshLambertMaterial color="#6b4a32" />
        </mesh>
      ) : null}
    </group>
  );
}

export function PlayerActor() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = runtime.player;
    if (!ref.current) return;
    ref.current.visible = runtime.phase !== "title";
    ref.current.position.set(p.x, p.y, p.z);
    ref.current.rotation.y = p.yaw;
  });
  return (
    <group ref={ref}>
      <Person isPlayer color="#4f6f56" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.55, 12]} />
        <meshBasicMaterial color="#1a2218" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

export function Visitors() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const list = runtime.visitors;
    for (let i = 0; i < refs.current.length; i++) {
      const g = refs.current[i];
      const v = list[i];
      if (!g) continue;
      if (!v) {
        g.visible = false;
        continue;
      }
      g.visible = true;
      g.position.set(v.x, v.y, v.z);
      g.rotation.y = v.yaw;
    }
  });
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <Person color={runtime.visitors[i]?.color ?? "#4f6f56"} />
        </group>
      ))}
    </group>
  );
}

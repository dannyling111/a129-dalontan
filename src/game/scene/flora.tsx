import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { POIS, WORLD, biomeAt, dist2, heightAt, pathDist, rand, slopeAt } from "../world";

type Tree = { x: number; y: number; z: number; s: number; rot: number; kind: "pine" | "leaf" | "sakura" };

function gatherTrees(): Tree[] {
  const list: Tree[] = [];
  for (let i = 0; i < 520; i++) {
    const x = (rand(i + 1) - 0.5) * (WORLD - 16);
    const z = (rand(i + 9) - 0.5) * (WORLD - 16);
    const h = heightAt(x, z);
    if (h < 0.4 || h > 14.5) continue;
    if (slopeAt(x, z) > 1.05) continue;
    if (pathDist(x, z) < 1.7) continue;
    let blocked = false;
    for (const p of POIS) {
      if (p.kind === "peak" || p.kind === "garden" || p.kind === "flag") continue;
      if (dist2(x, z, p.x, p.z) < 3.8 * 3.8) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    const b = biomeAt(x, z);
    const kind: Tree["kind"] = b === "sakura" ? "sakura" : h > 6.2 || b === "peak" ? "pine" : "leaf";
    list.push({ x, y: h, z, s: 0.65 + rand(i + 4) * 0.85, rot: rand(i + 6) * 6.2, kind });
    if (list.length >= 170) break;
  }
  for (let i = 0; i < 28; i++) {
    const x = -28 + (rand(i + 200) - 0.5) * 14;
    const z = -16 + (rand(i + 240) - 0.5) * 14;
    const h = heightAt(x, z);
    if (h < 0.35) continue;
    list.push({ x, y: h, z, s: 0.8 + rand(i) * 0.6, rot: rand(i + 2) * 5, kind: "sakura" });
  }
  return list;
}

function Instanced({
  items,
  geometry,
  color,
  yOff,
}: {
  items: Tree[];
  geometry: "cone" | "ico";
  color: string;
  yOff: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((t, i) => {
      dummy.position.set(t.x, t.y + yOff * t.s, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, dummy, yOff]);
  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
      {geometry === "cone" ? <coneGeometry args={[1.15, 3.3, 6]} /> : <icosahedronGeometry args={[1.45, 0]} />}
      <meshLambertMaterial color={color} flatShading />
    </instancedMesh>
  );
}

function Trunks({ items }: { items: Tree[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.7 * t.s, t.z);
      dummy.scale.set(0.18 * t.s, 1.4 * t.s, 0.18 * t.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, dummy]);
  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <cylinderGeometry args={[1, 1.15, 1, 5]} />
      <meshLambertMaterial color="#5a3d2c" />
    </instancedMesh>
  );
}

export function Trees() {
  const trees = useMemo(gatherTrees, []);
  const pine = trees.filter((t) => t.kind === "pine");
  const leaf = trees.filter((t) => t.kind === "leaf");
  const sakura = trees.filter((t) => t.kind === "sakura");
  return (
    <group>
      <Trunks items={trees} />
      <Instanced items={pine} geometry="cone" color="#3d6b4a" yOff={2.35} />
      <Instanced items={leaf} geometry="ico" color="#7eae5e" yOff={1.95} />
      <Instanced items={sakura} geometry="ico" color="#e8b4bb" yOff={1.9} />
    </group>
  );
}

export function Rocks() {
  const items = useMemo(() => {
    const list: { x: number; y: number; z: number; s: number; rx: number; rz: number }[] = [];
    for (let i = 0; i < 80; i++) {
      const x = (rand(i + 80) - 0.5) * 120;
      const z = (rand(i + 99) - 0.5) * 120;
      const h = heightAt(x, z);
      if (h < 0.5 || h > 16) continue;
      if (pathDist(x, z) < 1.8) continue;
      if (slopeAt(x, z) < 0.35 && h < 5) continue;
      list.push({
        x,
        y: h,
        z,
        s: 0.4 + rand(i + 2) * 1.1,
        rx: rand(i + 4) * 2,
        rz: rand(i + 5) * 2,
      });
    }
    return list;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.15, t.z);
      dummy.rotation.set(t.rx, 0, t.rz);
      dummy.scale.set(t.s, t.s * 0.7, t.s * 0.85);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, dummy]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshLambertMaterial color="#8d8a80" flatShading />
    </instancedMesh>
  );
}

export function Flowers() {
  const items = useMemo(() => {
    const list: { x: number; y: number; z: number; s: number; c: THREE.Color }[] = [];
    const colors = ["#d97b7b", "#e8c96a", "#e8b7c0", "#8fb7d4", "#f0ead8"].map((h) => new THREE.Color(h));
    for (let i = 0; i < 120; i++) {
      const garden = i < 36;
      const x = garden ? -16 + (rand(i) - 0.5) * 10 : (rand(i + 3) - 0.5) * 100;
      const z = garden ? -2 + (rand(i + 7) - 0.5) * 10 : (rand(i + 11) - 0.5) * 100;
      const h = heightAt(x, z);
      if (h < 0.4 || h > 6) continue;
      if (pathDist(x, z) < 1.2) continue;
      list.push({ x, y: h, z, s: 0.18 + rand(i + 2) * 0.16, c: colors[i % colors.length]! });
    }
    return list;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.12, t.z);
      dummy.scale.setScalar(t.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      ref.current!.setColorAt(i, t.c);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items, dummy]);
  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

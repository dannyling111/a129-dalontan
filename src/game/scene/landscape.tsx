import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD, biomeAt, heightAt, rand } from "../world";
import { runtime } from "../runtime";
import { isNight, skyForHour } from "../sky";

export function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(WORLD, WORLD, 96, 96);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let y = heightAt(x, z);
      if (y < -0.35) y = -0.35;
      pos.setY(i, y);
      const b = biomeAt(x, z);
      const n = rand(x * 1.7 + z * 3.1) * 0.08;
      if (b === "water" || y < 0.08) c.set("#cbb98a");
      else if (b === "sand") c.set("#e2d3a6");
      else if (b === "path") c.set("#e8d9b8");
      else if (b === "sakura") c.set("#d9c3b4").lerp(new THREE.Color("#e8b7bc"), 0.35 + n);
      else if (b === "garden") c.set("#6f9a58");
      else if (b === "village") c.set("#87a466");
      else if (b === "peak") {
        const t = Math.min(1, (y - 7.5) / 8);
        c.set("#8aa56a").lerp(new THREE.Color("#d9d4c6"), t);
      } else {
        const t = Math.min(1, y / 7);
        c.set("#678a52").lerp(new THREE.Color("#c3d39a"), t + n);
      }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  );
}

export function Water() {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color("#2f6d7c") },
        uShallow: { value: new THREE.Color("#8fcdd0") },
        uSky: { value: new THREE.Color("#d7eef0") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorld;
        void main() {
          vec3 p = position;
          float w = sin(p.x * 0.16 + uTime * 0.55) * 0.11 + sin(p.z * 0.21 + uTime * 0.72) * 0.08;
          p.y += w;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uDeep;
        uniform vec3 uShallow;
        uniform vec3 uSky;
        uniform float uTime;
        varying vec3 vWorld;
        void main() {
          vec3 view = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(view, vec3(0.0, 1.0, 0.0)), 0.0), 2.4);
          vec3 col = mix(uDeep, uShallow, fres);
          col = mix(col, uSky, fres * 0.5);
          float spark = 0.5 + 0.5 * sin(vWorld.x * 0.45 + uTime) * sin(vWorld.z * 0.4 + uTime * 1.15);
          col += spark * spark * 0.07;
          gl_FragColor = vec4(col, 0.86);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useFrame((s) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 4]} material={mat}>
      <planeGeometry args={[128, 118, 48, 40]} />
    </mesh>
  );
}

export function Atmosphere() {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const fogCol = useRef(new THREE.Color());

  useFrame(() => {
    const sky = skyForHour(runtime.timeHours, runtime.weather);
    scene.background = fogCol.current.set(sky.fog);
    if (scene.fog && "color" in scene.fog) {
      (scene.fog as THREE.Fog).color.copy(fogCol.current);
    }
    if (sun.current) {
      sun.current.color.set(sky.sun);
      sun.current.intensity = sky.sunIntensity;
      sun.current.position.set(sky.sunDir[0] * 80, sky.sunDir[1] * 80, sky.sunDir[2] * 80);
    }
    if (hemi.current) {
      hemi.current.color.set(sky.hemiSky);
      hemi.current.groundColor.set(sky.hemiGround);
    }
    if (amb.current) amb.current.intensity = sky.ambient;
  });

  const night = isNight(runtime.timeHours);

  return (
    <>
      <fog attach="fog" args={["#cfe0d6", 42, 155]} />
      <hemisphereLight ref={hemi} args={["#eef4ee", "#7d9468", 0.7]} />
      <ambientLight ref={amb} intensity={0.28} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={1.2}
        position={[40, 55, 18]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={2}
        shadow-camera-far={160}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.00035}
      />
      {night ? <Stars /> : null}
      <Clouds />
    </>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rand(i + 2) * Math.PI * 2;
      const h = 18 + rand(i + 9) * 50;
      const r = 40 + rand(i + 4) * 70;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#eef4ff" size={0.55} sizeAttenuation />
    </points>
  );
}

function Clouds() {
  const ref = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: (rand(i + 40) - 0.5) * 120,
        z: (rand(i + 70) - 0.5) * 120,
        y: 22 + rand(i + 3) * 8,
        s: 4 + rand(i + 11) * 6,
        a: rand(i) * 6,
      })),
    [],
  );
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.003;
  });
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[0, c.a, 0]} scale={[c.s, c.s * 0.38, c.s * 0.7]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshLambertMaterial color="#f4f1ea" transparent opacity={0.72} />
        </mesh>
      ))}
    </group>
  );
}

export function Fireflies() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 70;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rand(i) - 0.5) * 90;
      pos[i * 3 + 1] = 1 + rand(i + 2) * 4;
      pos[i * 3 + 2] = (rand(i + 5) - 0.5) * 90;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((s) => {
    if (!ref.current) return;
    const night = isNight(runtime.timeHours);
    (ref.current.material as THREE.PointsMaterial).opacity = night ? 0.9 : 0;
    const pos = ref.current.geometry.attributes.position;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, 1.2 + Math.sin(t * 1.3 + i) * 0.6 + rand(i) * 2);
      pos.setX(i, x + Math.sin(t * 0.4 + i) * 0.01);
      pos.setZ(i, z + Math.cos(t * 0.35 + i * 0.7) * 0.01);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#d9e87a" size={0.28} transparent opacity={0} depthWrite={false} />
    </points>
  );
}

export function Petals() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const n = 48;
  const seeds = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        x: -28 + (rand(i) - 0.5) * 16,
        z: -16 + (rand(i + 3) - 0.5) * 16,
        s: 0.12 + rand(i + 8) * 0.1,
        ph: rand(i + 4) * 12,
      })),
    [],
  );
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const p = seeds[i]!;
      const y = ((t * 0.55 + p.ph) % 7) + 0.4;
      dummy.position.set(p.x + Math.sin(t * 0.6 + i) * 1.4, y, p.z + Math.cos(t * 0.5 + i) * 1.2);
      dummy.rotation.set(t + i, t * 0.4, i);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <planeGeometry args={[1, 1]} />
      <meshLambertMaterial color="#f0c4c8" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

export function Rain() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rand(i + 20) - 0.5) * 90;
      pos[i * 3 + 1] = rand(i + 1) * 22;
      pos[i * 3 + 2] = (rand(i + 40) - 0.5) * 90;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const on = runtime.weather === "rain";
    (ref.current.material as THREE.PointsMaterial).opacity = on ? 0.45 : 0;
    if (!on) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - dt * 18;
      if (y < 0) y = 20;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#c8d4d8" size={0.12} transparent opacity={0} />
    </points>
  );
}

export function useSunSync() {
  useLayoutEffect(() => {
    return undefined;
  }, []);
}

"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { siteAsset } from "@/lib/site-asset";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type CanvasProps = {
  yaw: number;
  pitch: number;
  reducedMotion: boolean;
  compact: boolean;
  narrow: boolean;
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
};

type Profile = { x: number; z: number; y: number; radius: number };
type Point2 = [number, number];

const segmentsPerCorner = 8;
const segmentsPerSide = 12;
const pointsPerRing = (segmentsPerCorner + 1 + segmentsPerSide) * 4;
const imageWidth = 1536;
const imageHeight = 1024;
const imageCorners = {
  frontLeft: [220, 510] as Point2,
  frontRight: [730, 687] as Point2,
  backRight: [1263, 128] as Point2,
  backLeft: [830, 65] as Point2,
};

function outline({ x, z, y, radius }: Profile): THREE.Vector3[] {
  const corners: [number, number, number, number][] = [
    [x - radius, z - radius, Math.PI / 2, 0],
    [x - radius, -z + radius, 0, -Math.PI / 2],
    [-x + radius, -z + radius, -Math.PI / 2, -Math.PI],
    [-x + radius, z - radius, Math.PI, Math.PI / 2],
  ];
  const arcs = corners.map(([cx, cz, start, end]) => Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
    const angle = start + (end - start) * index / segmentsPerCorner;
    return new THREE.Vector3(cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius);
  }));
  return arcs.flatMap((arc, index) => {
    const last = arc[arc.length - 1];
    const next = arcs[(index + 1) % arcs.length][0];
    return [...arc, ...Array.from({ length: segmentsPerSide }, (_, segment) => last.clone().lerp(next, (segment + 1) / (segmentsPerSide + 1)))];
  });
}

function imageUv(point: THREE.Vector3, x: number, z: number): Point2 {
  const u = (point.x + x) / (2 * x);
  const v = (point.z + z) / (2 * z);
  const left = imageCorners.backLeft.map((value, index) => value + (imageCorners.frontLeft[index] - value) * v);
  const right = imageCorners.backRight.map((value, index) => value + (imageCorners.frontRight[index] - value) * v);
  const px = left[0] + (right[0] - left[0]) * u;
  const py = left[1] + (right[1] - left[1]) * u;
  return [px / imageWidth, 1 - py / imageHeight];
}

function topGeometry(profile: Profile) {
  const edge = outline(profile);
  const positions = [0, profile.y, 0, ...edge.flatMap((point) => point.toArray())];
  const uvs = [...imageUv(new THREE.Vector3(), profile.x, profile.z), ...edge.flatMap((point) => imageUv(point, profile.x, profile.z))];
  const indices: number[] = [];
  for (let i = 0; i < edge.length; i++) indices.push(0, i + 1, (i + 1) % edge.length + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function shellGeometry(profiles: Profile[], castSurface = false) {
  const interpolated: Profile[] = [];
  profiles.forEach((profile, index) => {
    if (index === profiles.length - 1) { interpolated.push(profile); return; }
    const next = profiles[index + 1];
    const steps = castSurface ? 5 : 1;
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      interpolated.push({
        x: profile.x + (next.x - profile.x) * t,
        z: profile.z + (next.z - profile.z) * t,
        y: profile.y + (next.y - profile.y) * t,
        radius: profile.radius + (next.radius - profile.radius) * t,
      });
    }
  });
  const rings = interpolated.map(outline);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i <= pointsPerRing; i++) {
      const point = ring[i % pointsPerRing];
      const ripple = castSurface ? 0.012 * Math.sin(i * 2.173 + ringIndex * 4.127) * Math.cos(i * 0.49 - ringIndex * 2.33) : 0;
      const normal = new THREE.Vector2(point.x / interpolated[ringIndex].x, point.z / interpolated[ringIndex].z).normalize();
      positions.push(point.x + normal.x * ripple, point.y, point.z + normal.y * ripple);
      uvs.push(i / pointsPerRing, ringIndex / (rings.length - 1));
    }
  });
  const stride = pointsPerRing + 1;
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let i = 0; i < pointsPerRing; i++) {
      const a = ring * stride + i;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const resources = useMemo(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room);
    return { generator, room, target };
  }, [gl]);
  useEffect(() => () => {
    resources.target.dispose();
    resources.generator.dispose();
    resources.room.dispose();
  }, [resources]);
  return <primitive object={resources.target.texture} attach="environment" />;
}

function ContextEvents({ onContextLost, onContextRestored }: Pick<CanvasProps, "onContextLost" | "onContextRestored">) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [gl, onContextLost, onContextRestored]);
  return null;
}

function castSilverTexture() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const grain = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const fine = grain - Math.floor(grain);
      const wave = Math.sin(x * 0.31 + Math.sin(y * 0.19)) * 0.5 + 0.5;
      const value = Math.round(158 + fine * 58 + wave * 18);
      const offset = (y * size + x) * 4;
      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 2);
  texture.needsUpdate = true;
  return texture;
}

function Ingot({ yaw, pitch, reducedMotion, onReady }: Pick<CanvasProps, "yaw" | "pitch" | "reducedMotion" | "onReady">) {
  const group = useRef<THREE.Group>(null);
  const firstFrame = useRef(false);
  const readyFrame = useRef<number>(0);
  const source = useLoader(THREE.TextureLoader, siteAsset("/images/pv-ingot-silver-brand.webp"));
  const photo = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  const silverGrain = useMemo(() => castSilverTexture(), []);
  const geometry = useMemo(() => {
    const cap: Profile = { x: 1.03, z: 1.91, y: 0.445, radius: 0.13 };
    const shoulder: Profile = { x: 1.2, z: 2.1, y: 0.23, radius: 0.23 };
    const base: Profile = { x: 1.285, z: 2.205, y: -0.46, radius: 0.29 };
    return {
      cap: topGeometry(cap),
      base: topGeometry(base),
      rim: shellGeometry([cap, { x: 1.08, z: 1.96, y: 0.41, radius: 0.16 }]),
      shoulder: shellGeometry([
        { x: 1.08, z: 1.96, y: 0.41, radius: 0.16 },
        { x: 1.12, z: 2.01, y: 0.36, radius: 0.18 },
        shoulder,
      ]),
      body: shellGeometry([
        shoulder,
        { x: 1.315, z: 2.235, y: -0.35, radius: 0.29 },
        { x: 1.32, z: 2.24, y: -0.405, radius: 0.30 },
        { x: 1.285, z: 2.205, y: -0.46, radius: 0.29 },
      ], true),
    };
  }, []);
  const { invalidate } = useThree();

  useEffect(() => () => {
    cancelAnimationFrame(readyFrame.current);
    photo.dispose();
    silverGrain.dispose();
    Object.values(geometry).forEach((part) => part.dispose());
  }, [photo, silverGrain, geometry]);
  useEffect(() => { invalidate(); }, [yaw, pitch, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!firstFrame.current) {
      firstFrame.current = true;
      readyFrame.current = requestAnimationFrame(onReady);
    }
    const smoothing = reducedMotion ? 1 : 1 - Math.exp(-11 * delta);
    group.current.rotation.y += (yaw - group.current.rotation.y) * smoothing;
    group.current.rotation.x += (pitch - group.current.rotation.x) * smoothing;
    if (Math.abs(yaw - group.current.rotation.y) > 0.001 || Math.abs(pitch - group.current.rotation.x) > 0.001) invalidate();
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry.cap}>
        <meshPhysicalMaterial map={photo} color="#ffffff" metalness={0.48} roughness={0.32} envMapIntensity={0.82} clearcoat={0.18} clearcoatRoughness={0.24} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.rim}>
        <meshStandardMaterial color="#e6e6e6" metalness={0.92} roughness={0.2} envMapIntensity={1.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.shoulder}>
        <meshStandardMaterial color="#c2c2c2" metalness={0.98} roughness={0.24} bumpMap={silverGrain} bumpScale={0.024} envMapIntensity={1.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.body}>
        <meshStandardMaterial color="#b8b8b8" metalness={0.98} roughness={0.27} bumpMap={silverGrain} bumpScale={0.045} envMapIntensity={1.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.base}>
        <meshStandardMaterial color="#808080" metalness={0.88} roughness={0.34} envMapIntensity={0.78} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Ingot360Canvas({ yaw, pitch, reducedMotion, compact, narrow, onReady, onContextLost, onContextRestored }: CanvasProps) {
  return (
    <Canvas
      className="hero-ingot-canvas"
      camera={{ position: compact ? [4.3, 3.8, 7.0] : narrow ? [7.3, 5.7, 12.5] : [4.25, 4.2, 7.3], fov: compact ? 38 : narrow ? 39 : 36, near: 0.1, far: 30 }}
      dpr={narrow ? [1, 1.25] : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ContextEvents onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <StudioEnvironment />
      <ambientLight intensity={0.26} />
      <directionalLight color="#f6f6f6" position={[-5, 7, 5]} intensity={1.15} />
      <directionalLight color="#c6c6c6" position={[5, 3, -5]} intensity={0.75} />
      <directionalLight color="#eeeeee" position={[5, 5, 4]} intensity={0.62} />
      <pointLight color="#ffffff" position={[-3, 5, 2]} intensity={12} distance={15} decay={2} />
      <pointLight color="#e8e8e8" position={[5, 2.5, 4]} intensity={15} distance={12} decay={2} />
      <Suspense fallback={null}>
        <Ingot yaw={yaw} pitch={pitch} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

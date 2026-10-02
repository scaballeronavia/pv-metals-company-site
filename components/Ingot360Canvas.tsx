"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { siteAsset } from "@/lib/site-asset";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type CanvasProps = {
  yaw: number;
  pitch: number;
  reducedMotion: boolean;
  compact: boolean;
  narrow: boolean;
  onReady: () => void;
};

type Profile = { x: number; z: number; y: number; radius: number };
type Point2 = [number, number];

const segmentsPerCorner = 8;
const pointsPerRing = (segmentsPerCorner + 1) * 4;
const imageWidth = 1535;
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
  return corners.flatMap(([cx, cz, start, end]) => Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
    const angle = start + (end - start) * index / segmentsPerCorner;
    return new THREE.Vector3(cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius);
  }));
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

function shellGeometry(profiles: Profile[]) {
  const rings = profiles.map(outline);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i <= pointsPerRing; i++) {
      const point = ring[i % pointsPerRing];
      positions.push(point.x, point.y, point.z);
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

function castTexture() {
  const width = 128;
  const pixels = new Uint8Array(width * width * 4);
  let seed = 170921;
  for (let i = 0; i < width * width; i++) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const grain = 196 + (seed % 54);
    pixels.set([grain, grain, grain, 255], i * 4);
  }
  const texture = new THREE.DataTexture(pixels, width, width);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1.5);
  texture.needsUpdate = true;
  return texture;
}

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const resources = useMemo(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    return { generator, room, texture: generator.fromScene(room).texture };
  }, [gl]);
  useEffect(() => () => {
    resources.texture.dispose();
    resources.generator.dispose();
    resources.room.dispose();
  }, [resources]);
  return <primitive object={resources.texture} attach="environment" />;
}

function Ingot({ yaw, pitch, reducedMotion, onReady }: Pick<CanvasProps, "yaw" | "pitch" | "reducedMotion" | "onReady">) {
  const group = useRef<THREE.Group>(null);
  const source = useLoader(THREE.TextureLoader, siteAsset("/images/pv-ingot-concept.jpg"));
  const photo = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  const grain = useMemo(() => castTexture(), []);
  const geometry = useMemo(() => {
    const cap: Profile = { x: 1.03, z: 1.91, y: 0.436, radius: 0.13 };
    const base: Profile = { x: 1.285, z: 2.205, y: -0.46, radius: 0.29 };
    return {
      cap: topGeometry(cap),
      base: topGeometry(base),
      rim: shellGeometry([cap, { x: 1.085, z: 1.965, y: 0.421, radius: 0.16 }]),
      body: shellGeometry([
        { x: 1.085, z: 1.965, y: 0.421, radius: 0.16 },
        { x: 1.155, z: 2.04, y: 0.365, radius: 0.20 },
        { x: 1.21, z: 2.10, y: 0.27, radius: 0.24 },
        { x: 1.315, z: 2.235, y: -0.35, radius: 0.29 },
        { x: 1.32, z: 2.24, y: -0.405, radius: 0.30 },
        { x: 1.285, z: 2.205, y: -0.46, radius: 0.29 },
      ]),
    };
  }, []);
  const { invalidate } = useThree();

  useEffect(() => () => {
    photo.dispose();
    grain.dispose();
    Object.values(geometry).forEach((part) => part.dispose());
  }, [photo, grain, geometry]);
  useEffect(() => { invalidate(); }, [yaw, pitch, reducedMotion, invalidate]);
  useEffect(() => {
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(onReady); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [onReady]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const smoothing = reducedMotion ? 1 : 1 - Math.exp(-11 * delta);
    group.current.rotation.y += (yaw - group.current.rotation.y) * smoothing;
    group.current.rotation.x += (pitch - group.current.rotation.x) * smoothing;
    if (Math.abs(yaw - group.current.rotation.y) > 0.001 || Math.abs(pitch - group.current.rotation.x) > 0.001) invalidate();
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry.cap}>
        <meshPhysicalMaterial map={photo} color="#e5e9e8" metalness={0.16} roughness={0.4} envMapIntensity={0.26} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.rim}>
        <meshPhysicalMaterial color="#b9c1c2" metalness={0.88} roughness={0.2} envMapIntensity={1.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.body}>
        <meshPhysicalMaterial color="#929c9f" metalness={0.91} roughness={0.28} roughnessMap={grain} bumpMap={grain} bumpScale={0.012} envMapIntensity={1.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.base}>
        <meshPhysicalMaterial color="#7b8588" metalness={0.9} roughness={0.3} envMapIntensity={1.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Ingot360Canvas({ yaw, pitch, reducedMotion, compact, narrow, onReady }: CanvasProps) {
  return (
    <Canvas
      className="hero-ingot-canvas"
      camera={{ position: compact ? [4.7, 4.05, 8.1] : narrow ? [5.5, 4.8, 9.4] : [3.4, 4.8, 7.5], fov: compact ? 39 : narrow ? 37 : 35, near: 0.1, far: 30 }}
      dpr={narrow ? [1, 1.25] : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <StudioEnvironment />
      <ambientLight intensity={0.36} />
      <directionalLight color="#ffffff" position={[-5, 7, 5]} intensity={2.1} />
      <directionalLight color="#d4e1e6" position={[5, 3, -5]} intensity={1.5} />
      <pointLight color="#ffffff" position={[-3, 5, 2]} intensity={22} distance={15} decay={2} />
      <pointLight color="#f18035" position={[5, 1.5, -1]} intensity={26} distance={12} decay={2} />
      <Ingot yaw={yaw} pitch={pitch} reducedMotion={reducedMotion} onReady={onReady} />
    </Canvas>
  );
}

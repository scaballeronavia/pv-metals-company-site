"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { siteAsset } from "@/lib/site-asset";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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
  frontLeft: [245, 555] as Point2,
  frontRight: [735, 695] as Point2,
  backRight: [1320, 125] as Point2,
  backLeft: [900, 35] as Point2,
};
const imageBase = {
  frontLeft: [140, 760] as Point2,
  frontRight: [745, 1004] as Point2,
  backRight: [1400, 350] as Point2,
};
const capHeight = 0.445;
const baseHeight = -0.33;

function interpolate(a: Point2, b: Point2, t: number): Point2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function photoUv(point: THREE.Vector3, profile: Profile): Point2 {
  const x = point.x / profile.x;
  const z = point.z / profile.z;
  const vertical = THREE.MathUtils.clamp((capHeight - point.y) / (capHeight - baseHeight), 0, 1);
  const front = Math.abs(z) >= Math.abs(x);
  const top = front
    ? interpolate(imageCorners.frontLeft, imageCorners.frontRight, (x + 1) / 2)
    : interpolate(imageCorners.frontRight, imageCorners.backRight, (1 - z) / 2);
  const bottom = front
    ? interpolate(imageBase.frontLeft, imageBase.frontRight, (x + 1) / 2)
    : interpolate(imageBase.frontRight, imageBase.backRight, (1 - z) / 2);
  const pixel = interpolate(top, bottom, vertical);
  return [pixel[0] / imageWidth, 1 - pixel[1] / imageHeight];
}

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
      uvs.push(...photoUv(point, interpolated[ringIndex]));
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

function CameraFraming({ compact, narrow }: Pick<CanvasProps, "compact" | "narrow">) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const position = compact ? [2.9, 5.1, 7.0] : narrow ? [5.9, 8.9, 14.4] : [2.7, 5.8, 7.3];
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, compact, narrow, invalidate]);
  return null;
}

function Ingot({ yaw, pitch, reducedMotion, onReady }: Pick<CanvasProps, "yaw" | "pitch" | "reducedMotion" | "onReady">) {
  const group = useRef<THREE.Group>(null);
  const firstFrame = useRef(false);
  const readyFrame = useRef<number>(0);
  const source = useLoader(THREE.TextureLoader, siteAsset("/images/pv-ingot-silver-brand-cutout.webp"));
  const photo = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  const geometry = useMemo(() => {
    const cap: Profile = { x: 1.03, z: 1.91, y: 0.445, radius: 0.13 };
    const shoulder: Profile = { x: 1.12, z: 2.02, y: 0.25, radius: 0.19 };
    const base: Profile = { x: 1.17, z: 2.12, y: -0.33, radius: 0.23 };
    return {
      cap: topGeometry(cap),
      base: topGeometry(base),
      rim: shellGeometry([cap, { x: 1.07, z: 1.95, y: 0.41, radius: 0.16 }]),
      shoulder: shellGeometry([
        { x: 1.07, z: 1.95, y: 0.41, radius: 0.16 },
        { x: 1.09, z: 1.97, y: 0.37, radius: 0.17 },
        shoulder,
      ]),
      body: shellGeometry([
        shoulder,
        { x: 1.2, z: 2.14, y: -0.23, radius: 0.23 },
        { x: 1.2, z: 2.14, y: -0.29, radius: 0.24 },
        base,
      ], true),
    };
  }, []);
  const { invalidate } = useThree();

  useEffect(() => () => {
    cancelAnimationFrame(readyFrame.current);
    photo.dispose();
    Object.values(geometry).forEach((part) => part.dispose());
  }, [photo, geometry]);
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
        <meshBasicMaterial map={photo} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.rim}>
        <meshBasicMaterial map={photo} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.shoulder}>
        <meshBasicMaterial map={photo} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.body}>
        <meshBasicMaterial map={photo} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.base}>
        <meshBasicMaterial color="#7f8183" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Ingot360Canvas({ yaw, pitch, reducedMotion, compact, narrow, onReady, onContextLost, onContextRestored }: CanvasProps) {
  return (
    <Canvas
      className="hero-ingot-canvas"
      camera={{ position: compact ? [2.9, 5.1, 7.0] : narrow ? [5.9, 8.9, 14.4] : [2.7, 5.8, 7.3], fov: 38, near: 0.1, far: 40 }}
      dpr={narrow ? [1, 1.25] : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <CameraFraming compact={compact} narrow={narrow} />
      <ContextEvents onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <Suspense fallback={null}>
        <Ingot yaw={yaw} pitch={pitch} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

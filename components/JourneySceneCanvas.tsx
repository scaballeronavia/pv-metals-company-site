"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type JourneyProps = {
  stage: number;
  progress: number;
  reducedMotion: boolean;
  compact: boolean;
  narrow: boolean;
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
};
type Pose = { x: number; y: number; z: number; size: number };
const goldenAngle = 2.3999632297;
const travelX = [1.85, -1.75, 1.8, -1.8, 1.85];
const mix = THREE.MathUtils.lerp;

function poseFor(stage: number, index: number, count: number): Pose {
  const u = (index + 0.5) / count;
  const angle = index * goldenAngle;
  const irregular = Math.sin(index * 17.31) * 0.12;
  if (stage === 0) {
    const polar = Math.acos(1 - 2 * u);
    const radius = 1.05 + 0.27 * Math.sin(index * 4.17);
    return { x: Math.sin(polar) * Math.cos(angle) * radius * 1.5, y: Math.cos(polar) * radius * 1.2, z: Math.sin(polar) * Math.sin(angle) * radius * 0.84, size: 0.085 + (index % 5) * 0.017 };
  }
  if (stage === 1) {
    return { x: (u - 0.5) * 4.35, y: Math.sin(u * Math.PI * 4) * 0.75 + irregular, z: Math.cos(u * Math.PI * 4) * 0.5, size: 0.07 + (index % 7) * 0.009 };
  }
  if (stage === 2) {
    const winding = u * Math.PI * 10;
    return { x: Math.cos(winding) * (0.82 + 0.1 * Math.sin(index)), y: (u - 0.5) * 3.25, z: Math.sin(winding) * 0.7, size: 0.075 + (index % 4) * 0.012 };
  }
  if (stage === 3) {
    const columns = 20;
    return { x: ((index % columns) - 9.5) * 0.17, y: (Math.floor(index / columns) - (Math.ceil(count / columns) - 1) / 2) * 0.18, z: Math.sin(index * 0.73) * 0.075, size: 0.084 };
  }
  const radius = Math.sqrt(u);
  return { x: Math.cos(angle) * radius * 2.15 + irregular, y: -0.75 + (1 - radius) * 1.3 + Math.cos(index * 3.2) * 0.09, z: Math.sin(angle) * radius * 0.95, size: 0.08 + (index % 6) * 0.014 };
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

function ContextEvents({ onContextLost, onContextRestored }: Pick<JourneyProps, "onContextLost" | "onContextRestored">) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onContextLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [gl, onContextLost, onContextRestored]);
  return null;
}

function JourneyContents({ stage, progress, reducedMotion, compact, narrow, onReady, onContextLost, onContextRestored }: JourneyProps) {
  const particles = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const ribbon = useRef<THREE.Mesh>(null);
  const slab = useRef<THREE.Mesh>(null);
  const reportedReady = useRef(false);
  const { invalidate } = useThree();
  const count = compact ? 140 : 180;
  const poses = useMemo(() => Array.from({ length: 5 }, (_, phase) => Array.from({ length: count }, (_, index) => poseFor(phase, index, count))), [count]);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const silver = useMemo(() => new THREE.Color("#d9e3e5"), []);
  const heat = useMemo(() => new THREE.Color("#ee8a4c"), []);
  const ribbonGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 16 }, (_, index) => {
      const u = index / 15;
      return new THREE.Vector3((u - 0.5) * 4.45, Math.sin(u * Math.PI * 4) * 0.75, Math.cos(u * Math.PI * 4) * 0.5);
    }));
    return new THREE.TubeGeometry(curve, 90, 0.07, 8, false);
  }, []);
  const slabGeometry = useMemo(() => new RoundedBoxGeometry(3.15, 2.05, 0.37, 4, 0.14), []);

  useEffect(() => () => { ribbonGeometry.dispose(); slabGeometry.dispose(); }, [ribbonGeometry, slabGeometry]);
  useEffect(() => { invalidate(); }, [stage, progress, reducedMotion, compact, narrow, invalidate]);

  useFrame(() => {
    const current = Math.max(0, Math.min(4, stage));
    const next = Math.min(4, current + 1);
    const blend = reducedMotion ? 0 : THREE.MathUtils.smoothstep(progress, 0.42, 0.97);
    const warmth = mix(current === 1 || current === 2 ? 0.75 : 0.08, next === 1 || next === 2 ? 0.75 : 0.08, blend);
    if (particles.current) {
      for (let index = 0; index < count; index++) {
        const from = poses[current][index];
        const to = poses[next][index];
        transform.position.set(mix(from.x, to.x, blend), mix(from.y, to.y, blend), mix(from.z, to.z, blend));
        const size = mix(from.size, to.size, blend);
        transform.scale.set(size, size * (0.86 + index % 3 * 0.08), size * (0.82 + index % 4 * 0.06));
        transform.rotation.set(index * 0.73, index * 1.17 + (current + progress) * 0.2, index * 0.47);
        transform.updateMatrix();
        particles.current.setMatrixAt(index, transform.matrix);
        color.copy(silver).lerp(heat, warmth * (index % 7 < 2 ? 0.8 : 0.22));
        particles.current.setColorAt(index, color);
      }
      particles.current.instanceMatrix.needsUpdate = true;
      if (particles.current.instanceColor) particles.current.instanceColor.needsUpdate = true;
    }
    if (group.current) {
      group.current.position.set(compact ? 0 : mix(travelX[current], travelX[next], blend) * (narrow ? 0.55 : 1), compact ? 1.05 : 0, 0);
      group.current.rotation.y = reducedMotion ? 0 : (current + progress) * 0.13;
    }
    if (ribbon.current) {
      const strength = mix(current === 1 ? 0.65 : 0, next === 1 ? 0.65 : 0, blend);
      ribbon.current.visible = strength > 0.01;
      (ribbon.current.material as THREE.MeshPhysicalMaterial).opacity = strength;
    }
    if (slab.current) {
      const strength = mix(current === 3 ? 0.82 : current === 4 ? 0.3 : 0, next === 3 ? 0.82 : next === 4 ? 0.3 : 0, blend);
      slab.current.visible = strength > 0.01;
      (slab.current.material as THREE.MeshPhysicalMaterial).opacity = strength;
    }
    if (!reportedReady.current) {
      reportedReady.current = true;
      onReady();
    }
  });

  return (
    <>
      <ContextEvents onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <StudioEnvironment />
      <ambientLight intensity={0.15} />
      <directionalLight color="#e6f2f4" position={[-4, 6, 7]} intensity={2} />
      <directionalLight color="#879ca1" position={[5, -3, 2]} intensity={1.2} />
      <pointLight color="#f68b47" position={[-3, 1, 4]} intensity={4.2} distance={9} decay={2} />
      <group ref={group}>
        <instancedMesh ref={particles} args={[undefined, undefined, count]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.25} envMapIntensity={1.55} />
        </instancedMesh>
        <mesh ref={ribbon} geometry={ribbonGeometry} visible={false}>
          <meshPhysicalMaterial color="#f8b474" emissive="#8c2c15" emissiveIntensity={0.42} metalness={0.78} roughness={0.24} transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh ref={slab} geometry={slabGeometry} visible={false} rotation={[-0.12, -0.28, 0]}>
          <meshPhysicalMaterial color="#c6d1d4" metalness={1} roughness={0.18} envMapIntensity={1.7} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

export default function JourneySceneCanvas(props: JourneyProps) {
  return (
    <Canvas
      className="journey-canvas"
      camera={{ position: [0, 0, 10], fov: props.compact ? 43 : 38, near: 0.1, far: 30 }}
      dpr={props.compact ? [1, 1] : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <JourneyContents {...props} />
    </Canvas>
  );
}

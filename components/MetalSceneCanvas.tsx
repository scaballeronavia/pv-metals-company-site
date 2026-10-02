"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type SceneProps = { progress: number; reducedMotion: boolean; compact: boolean; active: boolean };
const reveal = (progress: number, start: number, end: number) => THREE.MathUtils.smoothstep(progress, start, end);

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const resources = useMemo(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const texture = generator.fromScene(room).texture;
    return { generator, room, texture };
  }, [gl]);
  useEffect(() => () => {
    resources.texture.dispose();
    resources.generator.dispose();
    resources.room.dispose();
  }, [resources]);
  return <primitive object={resources.texture} attach="environment" />;
}

function ProductCloud() {
  const instances = useRef<THREE.InstancedMesh>(null);
  const count = 240;

  useEffect(() => {
    if (!instances.current) return;
    const transform = new THREE.Object3D();
    const tint = new THREE.Color();
    for (let index = 0; index < count; index++) {
      const angle = index * 2.3999632297;
      const radius = Math.sqrt((index + 0.5) / count);
      const jitter = Math.sin(index * 17.31) * 0.075;
      const size = 0.062 + (Math.sin(index * 11.71) * 0.5 + 0.5) * 0.07;
      transform.position.set(
        Math.cos(angle) * radius * 1.85 + jitter,
        -0.9 + (1 - radius) * 1.65 + Math.cos(index * 3.2) * 0.095,
        Math.sin(angle) * radius * 0.78 + Math.cos(index * 5.83) * 0.12,
      );
      transform.scale.set(size * (0.8 + (index % 3) * 0.14), size * (0.72 + (index % 5) * 0.1), size * (0.75 + (index % 4) * 0.13));
      transform.rotation.set(index * 0.73, index * 1.17, index * 0.47);
      transform.updateMatrix();
      instances.current.setMatrixAt(index, transform.matrix);
      tint.setHSL(0.54, 0.025, 0.46 + (index % 7) * 0.037);
      instances.current.setColorAt(index, tint);
    }
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor) instances.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={instances} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial color="#c0c7ca" metalness={1} roughness={0.25} envMapIntensity={1.5} />
    </instancedMesh>
  );
}

function SceneContents({ progress, reducedMotion, compact }: Omit<SceneProps, "active">) {
  const product = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const { invalidate } = useThree();

  useEffect(() => { invalidate(); }, [progress, reducedMotion, compact, invalidate]);

  useFrame((state, delta) => {
    const productWeight = reveal(progress, 0.12, 0.2) * (1 - reveal(progress, 0.34, 0.44));

    if (product.current) {
      product.current.visible = productWeight > 0.01;
      product.current.position.set(compact ? 0 : -2.15, compact ? 1.15 : 0, 0.8);
      const targetScale = (compact ? 0.72 : 1) * (0.76 + productWeight * 0.24);
      product.current.scale.setScalar(reducedMotion ? (compact ? 0.72 : 1) : THREE.MathUtils.damp(product.current.scale.x, targetScale, 6, delta));
      product.current.rotation.y = reducedMotion ? -0.25 : Math.sin(state.clock.elapsedTime * 0.28) * 0.24 + progress * 1.8 - 0.25;
      product.current.rotation.x = reducedMotion ? -0.18 : -0.18 + Math.sin(state.clock.elapsedTime * 0.18) * 0.07;
    }
    if (light.current && !reducedMotion) light.current.position.x = Math.sin(state.clock.elapsedTime * 0.36) * 3.2;
  });

  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.16} />
      <directionalLight color="#eaf3f3" position={[-4, 5, 6]} intensity={1.6} />
      <directionalLight color="#72909c" position={[5, -3, 2]} intensity={1.1} />
      <pointLight ref={light} color="#f5fcff" position={[2.7, 2.4, 4.5]} intensity={13} distance={11} decay={2} />
      <pointLight color="#e4782d" position={[-3, -2, 2]} intensity={3.8} distance={8} decay={2} />

      <group ref={product} position={[-1.9, 0, 0]} visible={false}>
        <ProductCloud />
      </group>
    </>
  );
}

export default function MetalSceneCanvas(props: SceneProps) {
  return (
    <Canvas
      className="metal-canvas"
      camera={{ position: [0, 0, 9], fov: 37, near: 0.1, far: 30 }}
      dpr={props.compact ? [1, 1] : [1, 1.5]}
      frameloop={props.reducedMotion || !props.active || props.progress < 0.12 || props.progress > 0.45 ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <SceneContents progress={props.progress} reducedMotion={props.reducedMotion} compact={props.compact} />
    </Canvas>
  );
}

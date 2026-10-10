import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

type RingProps = {
  reducedMotion: boolean;
};

/**
 * A single brushed-gold torus, slowly rotating. Kept deliberately cheap: one mesh, two lights,
 * no textures, so the 3D chunk stays small and low-end devices cope.
 */
function Ring({ reducedMotion }: RingProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || meshRef.current === null) {
      return;
    }
    meshRef.current.rotation.y += delta * 0.25;
    meshRef.current.rotation.x += delta * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.32, 32, 100]} />
      <meshStandardMaterial color="#c9a66b" metalness={1} roughness={0.25} />
    </mesh>
  );
}

type Hero3DSceneProps = {
  reducedMotion?: boolean;
};

export default function Hero3DScene({ reducedMotion = false }: Hero3DSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      dpr={[1, 2]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 5]} intensity={2.2} color="#fff3e0" />
      <directionalLight position={[-3, -2, -4]} intensity={0.8} color="#c9a66b" />
      <Ring reducedMotion={reducedMotion} />
    </Canvas>
  );
}
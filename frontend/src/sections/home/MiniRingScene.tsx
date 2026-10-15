import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/**
 * Low-poly, modern ring (thin torus) with a soft satin look.
 * Intent: Gen-Z minimal, no antique gold/brown tones.
 */
type RingProps = {
  reducedMotion: boolean;
};

function Ring({ reducedMotion }: RingProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || meshRef.current === null) {
      return;
    }
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x += delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.08, 24, 80]} />
      <meshStandardMaterial color="#d9d6cc" metalness={0.4} roughness={0.4} />
    </mesh>
  );
}

type MiniRingSceneProps = {
  reducedMotion: boolean;
};

export default function MiniRingScene({ reducedMotion }: MiniRingSceneProps) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3], fov: 40 }} gl={{ antialias: true }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 2, 3]} intensity={1.2} color="#f5f5f5" />
      <directionalLight position={[-2, -1, -2]} intensity={0.5} color="#e9e9e9" />
      <Ring reducedMotion={reducedMotion} />
    </Canvas>
  );
}

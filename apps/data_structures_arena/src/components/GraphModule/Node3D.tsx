import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GraphNode } from './useDijkstra';

interface Node3DProps {
  node: GraphNode;
  isCurrent: boolean;
}

export const Node3D = ({ node, isCurrent }: Node3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);

  // Colores Cyberpunk intensos
  const color = useMemo(() => {
    switch (node.status) {
      case 'unvisited': return '#3b82f6'; // blue-500
      case 'evaluating': return '#f59e0b'; // amber-500
      case 'visited': return '#8b5cf6'; // violet-500
      case 'path': return '#10b981'; // emerald-500
      default: return '#3b82f6';
    }
  }, [node.status]);

  useFrame((state) => {
    if (meshRef.current) {
      // Flotación suave constante
      meshRef.current.position.y = node.y + Math.sin(state.clock.elapsedTime * 2 + node.x) * 0.15;
      if (outerGlowRef.current) {
        outerGlowRef.current.position.y = meshRef.current.position.y;
      }
    }
    if (outerGlowRef.current) {
      if (isCurrent || node.status === 'path' || node.status === 'evaluating') {
        // Efecto de pulso fuerte
        const scale = 1.3 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
        outerGlowRef.current.scale.set(scale, scale, scale);
      } else {
        outerGlowRef.current.scale.set(1.1, 1.1, 1.1);
      }
    }
  });

  return (
    <group position={[node.x, 0, node.z]}>
      {/* Esfera exterior (Glow holográfico) */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={isCurrent ? 0.5 : node.status === 'path' ? 0.4 : 0.15} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* Núcleo interno metálico/neón */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isCurrent || node.status === 'path' ? 3 : 1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Etiqueta HTML Cyberpunk */}
      <Html position={[0, node.y + 0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center">
          <div className="bg-[#050510]/80 backdrop-blur-md px-3 py-1 rounded text-white font-mono font-bold text-[11px] border border-slate-700/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <span className="text-slate-300">NODO</span>
            <span className="text-lg text-white" style={{ textShadow: `0 0 10px ${color}` }}>{node.label}</span>
          </div>
          {node.distance < Infinity && (
            <div className="mt-1 bg-black/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono border border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              COSTO: {node.distance}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

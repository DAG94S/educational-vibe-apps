import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GraphNode, GraphEdge } from './useDijkstra';

interface Edge3DProps {
  edge: GraphEdge;
  sourceNode: GraphNode;
  targetNode: GraphNode;
}

export const Edge3D = ({ edge, sourceNode, targetNode }: Edge3DProps) => {
  // Calcular posición, rotación y escala del cilindro
  const { position, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z);
    const end = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);
    
    const distance = start.distanceTo(end);
    const position = start.clone().lerp(end, 0.5);
    
    const direction = end.clone().sub(start).normalize();
    const axis = new THREE.Vector3(0, 1, 0); // Para cilindros alineados en Y
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    return { position, rotation, length: distance };
  }, [sourceNode, targetNode]);

  // Colores reactivos Cyberpunk
  const color = useMemo(() => {
    if (edge.isPath) return '#10b981'; // emerald-500
    if (edge.isEvaluating) return '#f59e0b'; // amber-500
    return '#334155'; // slate-700
  }, [edge.isPath, edge.isEvaluating]);

  return (
    <group>
      {/* Línea láser flotante */}
      <mesh position={position} rotation={rotation}>
        <cylinderGeometry args={[0.04, 0.04, length, 8]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={edge.isPath || edge.isEvaluating ? 3 : 0}
          transparent
          opacity={edge.isPath || edge.isEvaluating ? 1 : 0.3}
        />
      </mesh>

      {/* Halo láser exterior para caminos activos */}
      {(edge.isPath || edge.isEvaluating) && (
        <mesh position={position} rotation={rotation}>
          <cylinderGeometry args={[0.08, 0.08, length, 8]} />
          <meshBasicMaterial 
            color={color} 
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Etiqueta de peso holográfica en el medio */}
      <Html position={[position.x, position.y + 0.2, position.z]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all duration-300 backdrop-blur-sm ${
          edge.isPath ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110' :
          edge.isEvaluating ? 'bg-amber-900/60 text-amber-300 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110' :
          'bg-slate-900/40 text-slate-400 border border-slate-700/50 scale-100'
        }`}>
          {edge.weight}
        </div>
      </Html>
    </group>
  );
};

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { GraphData } from './useDijkstra';
import { Node3D } from './Node3D';
import { Edge3D } from './Edge3D';
import * as THREE from 'three';
import { useEffect } from 'react';

interface GraphSceneProps {
  graph: GraphData;
  currentNodeId: string | null;
}

// Componente para manejar la cámara dinámica
const DynamicCamera = ({ currentNodeId, graph }: { currentNodeId: string | null, graph: GraphData }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (currentNodeId) {
      const node = graph.nodes.find(n => n.id === currentNodeId);
      if (node) {
        // Interpolar suavemente hacia el nodo actual, manteniendo un poco de distancia
        const targetPosition = new THREE.Vector3(node.x, node.y + 2, node.z + 6);
        camera.position.lerp(targetPosition, 0.05);
      }
    }
  });

  // Al resetear, volver a una posición global
  useEffect(() => {
    if (!currentNodeId) {
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);
    }
  }, [currentNodeId, camera]);

  return null;
};

export const GraphScene = ({ graph, currentNodeId }: GraphSceneProps) => {
  return (
    <div className="w-full h-full bg-[#050510] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050510]/80 to-[#050510] pointer-events-none z-0"></div>
      
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }} className="z-10 relative">
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 5, 30]} />
        
        {/* Iluminación Sci-Fi Neón */}
        <ambientLight intensity={0.3} color="#4c1d95" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -5]} intensity={2} color="#8b5cf6" />
        <pointLight position={[0, 10, 0]} intensity={1} color="#06b6d4" />
        
        {/* Fondo estrellado cibernético */}
        <Stars radius={100} depth={50} count={6000} factor={5} saturation={1} fade speed={1.5} />

        {/* Rejilla Cibernética Inferior */}
        <gridHelper args={[50, 50, '#1e1b4b', '#0f172a']} position={[0, -2, 0]} />

        <DynamicCamera currentNodeId={currentNodeId} graph={graph} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={25}
          minDistance={2}
          dampingFactor={0.05}
        />

        {/* Renderizar Aristas */}
        {graph.edges.map(edge => {
          const sourceNode = graph.nodes.find(n => n.id === edge.source);
          const targetNode = graph.nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;
          
          return (
            <Edge3D 
              key={edge.id}
              edge={edge}
              sourceNode={sourceNode}
              targetNode={targetNode}
            />
          );
        })}

        {/* Renderizar Nodos */}
        {graph.nodes.map(node => (
          <Node3D 
            key={node.id} 
            node={node} 
            isCurrent={currentNodeId === node.id}
          />
        ))}
      </Canvas>
    </div>
  );
};

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box, Cylinder } from '@react-three/drei';
import { useRouterStore, type NodeId } from '../store/routerStore';
import * as THREE from 'three';

const Node = ({ id, position, label, isEndpoint }: { id: NodeId, position: [number, number, number], label: string, isEndpoint?: boolean }) => {
  const { selectedNode, setSelectedNode, routingTables } = useRouterStore();
  const isSelected = selectedNode === id;
  
  // Light theme colors: Endpoints Blue, Routers Violet, Selected Red
  const color = isEndpoint ? '#3b82f6' : (isSelected ? '#ef4444' : '#8b5cf6');
  
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (groupRef.current && !isEndpoint) {
      // Slight hover animation for routers
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.1;
    }
  });

  return (
    <group 
      position={position} 
      ref={groupRef}
    >
      {/* Invisible Hitbox to ensure smooth clicking */}
      <mesh 
        visible={false} 
        onClick={(e) => { e.stopPropagation(); setSelectedNode(id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[2, 1.5, 1.5]} />
      </mesh>

      {isEndpoint ? (
        // PC Model
        <group>
          {/* Monitor */}
          <Box args={[1.2, 0.8, 0.2]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color="#cbd5e1" />
          </Box>
          {/* Screen */}
          <Box args={[1.1, 0.7, 0.05]} position={[0, 0.4, 0.1]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </Box>
          {/* Base */}
          <Cylinder args={[0.3, 0.4, 0.1, 16]} position={[0, -0.05, 0]}>
            <meshStandardMaterial color="#94a3b8" />
          </Cylinder>
          <Box args={[0.1, 0.4, 0.1]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#94a3b8" />
          </Box>
        </group>
      ) : (
        // Router Model
        <group>
          {/* Main Body */}
          <Box args={[1.5, 0.3, 1]}>
             <meshStandardMaterial color="#cbd5e1" />
          </Box>
          {/* Glowing trim */}
          <Box args={[1.55, 0.1, 1.05]}>
             <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1 : 0.5} />
          </Box>
          {/* Antennas */}
          <Cylinder args={[0.02, 0.02, 0.5]} position={[-0.6, 0.3, -0.4]}>
             <meshStandardMaterial color="#64748b" />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.5]} position={[0.6, 0.3, -0.4]}>
             <meshStandardMaterial color="#64748b" />
          </Cylinder>
        </group>
      )}
      
      {/* Selection Highlight */}
      <Sphere args={[isEndpoint ? 1.5 : 1.2]} visible={isSelected || hovered}>
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.2 : 0.1} wireframe />
      </Sphere>

      <Text position={[0, -1, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="white">
        {label}
      </Text>
      
      {/* Routing Table Status */}
      {isSelected && !isEndpoint && routingTables[id] && (
        <group position={[0, 1.2, 0]}>
           <Text fontSize={0.2} color="#16a34a">
             {routingTables[id].length === 0 ? 'Table Empty' : 'Routes Configured'}
           </Text>
        </group>
      )}
    </group>
  );
};

const Edges = () => {
  const { nodes, edges } = useRouterStore();
  
  return (
    <>
      {edges.map((edge, idx) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;
        
        return (
          <Line 
            key={idx}
            points={[sourceNode.position, targetNode.position]}
            color="#94a3b8"
            lineWidth={3}
            transparent
            opacity={0.5}
          />
        );
      })}
    </>
  );
};

const Packet = () => {
  const { simulationState, simulationResult, packetPath, nodes, finishSimulation } = useRouterStore();
  const packetRef = useRef<THREE.Group>(null);
  const currentIndexRef = useRef(0);
  const finishedRef = useRef(false);

  const color = (simulationState === 'SUCCESS' || simulationResult === 'SUCCESS') ? '#22c55e' : 
                (simulationState === 'FAILED_DROP' || simulationState === 'FAILED_LOOP' || simulationResult === 'FAILED_DROP' || simulationResult === 'FAILED_LOOP') ? '#ef4444' : '#3b82f6';

  useFrame((state, delta) => {
    if (!packetRef.current) return;
    
    // If we haven't reached the end of the path
    if (currentIndexRef.current < packetPath.length) {
      const targetNodeId = packetPath[currentIndexRef.current];
      const targetNode = nodes.find(n => n.id === targetNodeId);
      
      if (targetNode) {
        const targetPos = new THREE.Vector3(...targetNode.position);
        const currentPos = packetRef.current.position;
        
        // Move towards target (slower for better WOW factor)
        const speed = 2.5 * delta;
        currentPos.lerp(targetPos, speed);
        
        // If close enough, move to next node
        if (currentPos.distanceTo(targetPos) < 0.2) {
           currentIndexRef.current += 1;
        }
      }
    } else {
      // Reached the end
      if (!finishedRef.current) {
        finishedRef.current = true;
        finishSimulation();
      }
      // animate floating slightly
      packetRef.current.position.y += Math.sin(state.clock.elapsedTime * 5) * 0.005;
    }
  });

  // Start at the first node's position
  if (simulationState === 'IDLE' || packetPath.length === 0) return null;

  const startNode = nodes.find(n => n.id === packetPath[0]);
  const initialPosition = startNode ? startNode.position : [0, 0, 0] as [number, number, number];

  return (
    <group ref={packetRef} position={initialPosition}>
       <Sphere args={[0.3]}>
          <meshBasicMaterial color={color} />
       </Sphere>
       {/* Glow effect */}
       <Sphere args={[0.45]}>
          <meshBasicMaterial color={color} transparent opacity={0.4} />
       </Sphere>
       <pointLight color={color} intensity={2} distance={3} />
    </group>
  );
}

export const Scene = () => {
  const { nodes, setSelectedNode } = useRouterStore();

  return (
    <div className="w-full h-full bg-slate-50">
      <Canvas 
        camera={{ position: [0, 5, 8], fov: 60 }} 
        onPointerMissed={() => setSelectedNode(null)}
      >
        <color attach="background" args={['#f8fafc']} />
        <fog attach="fog" args={['#f8fafc', 5, 20]} />
        
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        
        <gridHelper args={[30, 30, '#cbd5e1', '#e2e8f0']} position={[0, -2, 0]} />

        <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.1} />
        
        <Edges />
        
        {nodes.map(node => (
          <Node key={node.id} {...node} />
        ))}

        <Packet />
      </Canvas>
    </div>
  );
};

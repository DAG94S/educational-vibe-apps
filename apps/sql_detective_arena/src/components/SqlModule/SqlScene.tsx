import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

interface SqlSceneProps {
  affectedTables: string[];
}

// Representa una Tabla en la BD
const TableCluster = ({ name, position, isActive, color }: { name: string, position: [number, number, number], isActive: boolean, color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Servidor Core */}
      <mesh>
        <boxGeometry args={[1.8, 2.8, 1.8]} />
        <meshStandardMaterial 
          color="#05010f" 
          metalness={0.9} 
          roughness={0.1}
          emissive={isActive ? color : '#05010f'}
          emissiveIntensity={isActive ? 1.5 : 0.1}
          wireframe={!isActive}
        />
      </mesh>
      
      {/* Anillos de Datos (Estructura de la tabla) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, i - 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={isActive ? color : '#334155'} transparent opacity={isActive ? 0.8 : 0.3} />
        </mesh>
      ))}

      {/* Holograma Exterior cuando está activa */}
      {isActive && (
        <mesh>
          <boxGeometry args={[2.2, 3.2, 2.2]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {/* Partículas alrededor del servidor */}
      {isActive && (
        <Sparkles count={50} scale={3} size={2} color={color} speed={0.4} />
      )}

      {/* Etiqueta Holográfica */}
      <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-4 py-1.5 rounded font-mono font-black text-sm backdrop-blur-md transition-all duration-300 tracking-[0.2em] uppercase ${
          isActive 
            ? `bg-[#05010f]/80 text-[#00f0ff] border border-[${color}] shadow-[0_0_20px_${color}] scale-110` 
            : 'bg-[#05010f]/50 text-slate-500 border border-slate-800'
        }`}
        style={{ color: isActive ? color : undefined, borderColor: isActive ? color : undefined, boxShadow: isActive ? `0 0 20px ${color}` : undefined }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
};

// Representa el JOIN entre tablas
const JoinLaser = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  const start = new THREE.Vector3(-6, 0, 0);
  const end = new THREE.Vector3(6, 0, 0);
  const distance = start.distanceTo(end);
  
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      {/* Laser Core */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      {/* Laser Glow */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, distance, 8]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, distance, 8]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.1} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      
      {/* Partículas de transferencia de datos */}
      <Sparkles count={100} scale={[1, distance, 1]} size={3} color="#a855f7" speed={2} />

      <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-[#05010f]/90 text-[#a855f7] px-3 py-1 rounded text-xs font-mono border border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.6)] backdrop-blur-md uppercase tracking-widest font-bold">
          [ JOIN_PROTOCOL_ACTIVE ]
        </div>
      </Html>
    </group>
  );
};

export const SqlScene = ({ affectedTables }: SqlSceneProps) => {
  const isSuspectsActive = affectedTables.includes('suspects');
  const isGangsActive = affectedTables.includes('gangs');
  const isJoinActive = isSuspectsActive && isGangsActive;

  return (
    <div className="w-full h-full bg-[#05010f] relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom pointer-events-none z-0"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#05010f_100%)] pointer-events-none z-0"></div>
      
      <Canvas camera={{ position: [0, 8, 22], fov: 45 }} className="z-10 relative">
        <fog attach="fog" args={['#05010f', 12, 40]} />
        
        <ambientLight intensity={0.2} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={3} color="#00f0ff" />
        <pointLight position={[-5, 5, 5]} intensity={2} color="#ff2a85" />
        
        {/* Floating dust/stars */}
        <Sparkles count={500} scale={20} size={1} color="#00f0ff" opacity={0.2} speed={0.2} />

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={20} />

        <TableCluster name="suspects" position={[-6, 0, 0]} isActive={isSuspectsActive} color="#00f0ff" />
        <TableCluster name="gangs" position={[6, 0, 0]} isActive={isGangsActive} color="#ff2a85" />
        
        <JoinLaser isActive={isJoinActive} />
      </Canvas>
    </div>
  );
};

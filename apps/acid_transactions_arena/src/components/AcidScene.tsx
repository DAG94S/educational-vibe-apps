import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface AcidSceneProps {
  isLocked: boolean;
  activeThreads: number;
  hasCrash?: boolean;
}

const Vault = ({ isLocked, hasCrash }: { isLocked: boolean; hasCrash?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (shieldRef.current && isLocked) {
      shieldRef.current.rotation.x = state.clock.elapsedTime;
      shieldRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      // Pulsate shield opacity
      const mat = shieldRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Base Server Body */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1.5, 1.5, 3, 6]} />
        <meshPhysicalMaterial 
          color={hasCrash ? "#ff0000" : "#05010f"}
          emissive={hasCrash ? "#ff0000" : "#00f0ff"}
          emissiveIntensity={hasCrash ? 1 : 0.3}
          wireframe={true}
          transparent
          opacity={0.8}
        />
        {/* Core Database Glowing Center */}
        <mesh>
          <cylinderGeometry args={[1, 1, 2.5, 6]} />
          <meshBasicMaterial color={hasCrash ? "#ff0000" : "#00f0ff"} transparent opacity={hasCrash ? 0.6 : 0.2} />
        </mesh>
      </mesh>

      {/* Isolation Shield (Lock) */}
      {isLocked && (
        <mesh ref={shieldRef} scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshPhysicalMaterial 
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            wireframe={true}
          />
          <Html position={[0, 3, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="bg-[#00f0ff]/20 text-[#00f0ff] px-3 py-1 rounded text-[10px] font-mono border border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.8)] backdrop-blur-md uppercase font-bold tracking-widest whitespace-nowrap">
              [ ISOLATION_LOCK_ACTIVE ]
            </div>
          </Html>
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-4 py-2 rounded text-xs font-mono border backdrop-blur-sm uppercase tracking-widest font-bold ${hasCrash ? 'bg-[#ff0000]/20 text-[#ff0000] border-[#ff0000]' : 'bg-[#05010f]/80 text-[#00f0ff] border-[#00f0ff]/50'}`}>
          {hasCrash ? '!!! SYSTEM_CRASH !!!' : 'VAULT-1 (ACCOUNT)'}
        </div>
      </Html>
    </group>
  );
};

const DataPacket = ({ 
  startPos, 
  targetPos, 
  color, 
  isActive, 
  isLocked, 
  hasCrash, 
  label 
}: { 
  startPos: [number, number, number], 
  targetPos: [number, number, number],
  color: string,
  isActive: boolean,
  isLocked: boolean,
  hasCrash?: boolean,
  label: string
}) => {
  const packetRef = useRef<THREE.Mesh>(null);
  
  // Custom animation state logic
  useFrame((state, delta) => {
    if (!packetRef.current) return;
    
    // Si no está activo, el paquete está en la base (origen)
    if (!isActive) {
      packetRef.current.position.set(...startPos);
      packetRef.current.visible = false;
      return;
    }

    packetRef.current.visible = true;

    // Lógica de movimiento
    const currentPos = packetRef.current.position;
    const target = new THREE.Vector3(...targetPos);
    const start = new THREE.Vector3(...startPos);
    
    // Distancia al centro del Vault
    const distToTarget = currentPos.distanceTo(target);

    // ESCENARIO 3: ATOMICIDAD (ROLLBACK)
    // Si hay un crash, el paquete retrocede hacia su origen en lugar de avanzar
    if (hasCrash) {
      const dirToStart = new THREE.Vector3().subVectors(start, currentPos).normalize();
      if (currentPos.distanceTo(start) > 0.5) {
        currentPos.add(dirToStart.multiplyScalar(delta * 15)); // Vuela rápido hacia atrás
      }
      return;
    }

    // ESCENARIO 2: AISLAMIENTO (LOCK)
    // Si está bloqueado y este paquete intenta entrar (pero aún no está en el centro)
    // Se detiene al chocar contra el radio del escudo (aprox distancia 2.5)
    if (isLocked && distToTarget < 2.8 && distToTarget > 0.5) {
      // Rebotar ligeramente en el escudo
      currentPos.y += Math.sin(state.clock.elapsedTime * 10) * 0.02;
      return; // No avanza más
    }

    // ESCENARIO NORMAL: Mover hacia el objetivo
    if (distToTarget > 0.1) {
      const dirToTarget = new THREE.Vector3().subVectors(target, currentPos).normalize();
      currentPos.add(dirToTarget.multiplyScalar(delta * 5)); // Velocidad normal
    }
  });

  return (
    <group>
      {/* Origin Node */}
      <mesh position={startPos}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} wireframe opacity={isActive ? 0.3 : 0.05} transparent />
        <Html position={[0, -1.5, 0]} center style={{ pointerEvents: 'none', opacity: isActive ? 1 : 0.2, transition: 'opacity 0.3s' }}>
          <div className={`text-[${color}] text-[10px] font-mono font-bold tracking-widest`} style={{ color: color }}>
            {label}
          </div>
        </Html>
      </mesh>

      {/* Flying Packet */}
      <mesh ref={packetRef} position={startPos}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={color} />
        <pointLight color={color} intensity={2} distance={5} />
        <Html position={[0, 0.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-[#05010f]/90 px-2 py-0.5 rounded border text-[8px] font-mono uppercase font-bold tracking-widest" style={{ borderColor: color, color: color }}>
            {hasCrash ? 'ROLLBACK' : 'DATA'}
          </div>
        </Html>
      </mesh>
    </group>
  );
};

export const AcidScene = ({ isLocked, activeThreads, hasCrash }: AcidSceneProps) => {
  return (
    <div className="w-full h-full bg-[#05010f] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#05010f_100%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        transform: 'perspective(600px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
      }}></div>

      <Canvas camera={{ position: [0, 8, 16], fov: 45 }} className="z-10 relative">
        <fog attach="fog" args={['#05010f', 5, 30]} />
        <ambientLight intensity={0.5} color="#ffffff" />
        
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={20} />

        <Vault isLocked={isLocked} hasCrash={hasCrash} />
        
        {/* Thread A (Attacker) - Red */}
        <DataPacket 
          startPos={[-6, 2, 0]} 
          targetPos={[0, 0, 0]} 
          color="#ff2a85" 
          isActive={activeThreads >= 1} 
          isLocked={false} // Thread A always acquires the lock first in our simulation
          hasCrash={hasCrash}
          label="THREAD_A_NODE"
        />

        {/* Thread B (Legit) - Blue */}
        <DataPacket 
          startPos={[6, 2, 0]} 
          targetPos={[0, 0, 0]} 
          color="#00f0ff" 
          isActive={activeThreads === 2} 
          isLocked={isLocked} // Thread B gets blocked by the lock
          hasCrash={false}
          label={activeThreads === 2 ? "THREAD_B_NODE" : "THREAD_B [STANDBY]"}
        />
      </Canvas>
    </div>
  );
};

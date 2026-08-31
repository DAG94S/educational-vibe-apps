import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import { Box, Cylinder, Sphere, Html } from '@react-three/drei';
import { motion } from 'framer-motion';

const FrontendNode = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const step = useGameStore(state => state.missionStep);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const isSending = step === 'SENDING_REQ' || step === 'RENDERING' || step === 'SUCCESS';
  const showBrowser = step === 'RENDERING' || step === 'SUCCESS';

  return (
    <group position={position}>
      <Box ref={ref} args={[2, 1.5, 0.2]}>
        <meshStandardMaterial 
          color="#00f3ff" 
          emissive="#00f3ff" 
          emissiveIntensity={isSending ? 2 : 0.5} 
          transparent 
          opacity={0.8} 
        />
      </Box>
      {showBrowser && (
        <Html position={[0, 1.5, 0]} center transform scale={0.7}>
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-96 h-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,243,255,0.7)] border border-gray-300 overflow-hidden flex flex-col pointer-events-none select-none origin-bottom"
          >
            {/* browser header */}
            <div className="bg-gray-200 p-3 flex gap-2 items-center border-b border-gray-300">
               <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner"></div>
               <div className="w-3 h-3 rounded-full bg-green-400 shadow-inner"></div>
               <div className="bg-white text-xs px-3 py-1 rounded-md w-full text-center text-gray-500 font-mono shadow-sm">https://misitio.edu.ec</div>
            </div>
            {/* browser body */}
            <div className="p-6 text-gray-800 flex flex-col items-center justify-center h-full bg-gray-50 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 to-transparent opacity-50"></div>
               <h1 className="text-3xl font-bold text-blue-600 mb-3 z-10">¡Hola, Mundo! 🚀</h1>
               <p className="text-base text-center text-gray-600 z-10 font-medium">La página web fue renderizada con éxito desde el servidor.</p>
               <div className="mt-6 w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner z-10">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 0.5 }}
                   className="h-full bg-blue-500"
                 ></motion.div>
               </div>
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
};

const BackendNode = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const step = useGameStore(state => state.missionStep);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.02;
      ref.current.rotation.y += 0.02;
    }
  });

  const isProcessing = ['SENDING_REQ', 'QUERY_DB', 'DB_RESP', 'SENDING_RESP'].includes(step);

  return (
    <group position={position}>
      <Sphere ref={ref} args={[1.2, 32, 32]}>
        <meshStandardMaterial 
          color="#b026ff" 
          emissive="#b026ff" 
          emissiveIntensity={isProcessing ? 3 : 0.5} 
          wireframe
        />
      </Sphere>
    </group>
  );
};

const DatabaseNode = ({ position }: { position: [number, number, number] }) => {
  const step = useGameStore(state => state.missionStep);
  const isQuerying = ['QUERY_DB', 'DB_RESP'].includes(step);

  return (
    <group position={position}>
      <Cylinder args={[1.5, 1.5, 3, 32]}>
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={isQuerying ? 3 : 0.2} 
        />
      </Cylinder>
    </group>
  );
};

const DataParticles = () => {
  const step = useGameStore(state => state.missionStep);
  const isPaused = useGameStore(state => state.isPaused);
  const reachDestination = useGameStore(state => state.reachDestination);
  const particleRef = useRef<THREE.Mesh>(null);
  const particleColor = useRef("#00f3ff");
  
  useFrame((_, delta) => {
    if (!particleRef.current) return;
    
    // Stop moving if game is paused for theory modal
    if (isPaused) return;

    const speed = 15;
    
    switch (step) {
      case 'SENDING_REQ':
        particleRef.current.visible = true;
        particleColor.current = "#00f3ff"; // Azul
        particleRef.current.position.x += speed * delta;
        if (particleRef.current.position.x >= 0) {
          particleRef.current.position.x = 0;
          reachDestination('QUERY_DB', 'BACKEND_REQ');
        }
        break;
      case 'QUERY_DB':
        particleRef.current.visible = true;
        particleColor.current = "#b026ff"; // Morado
        particleRef.current.position.x += speed * delta;
        if (particleRef.current.position.x >= 5) {
          particleRef.current.position.x = 5;
          reachDestination('DB_RESP', 'DATABASE');
        }
        break;
      case 'DB_RESP':
        particleRef.current.visible = true;
        particleColor.current = "#ff00ff"; // Rosa
        particleRef.current.position.x -= speed * delta; // Regreso
        if (particleRef.current.position.x <= 0) {
          particleRef.current.position.x = 0;
          reachDestination('SENDING_RESP', 'BACKEND_RESP');
        }
        break;
      case 'SENDING_RESP':
        particleRef.current.visible = true;
        particleColor.current = "#00f3ff"; // Azul
        particleRef.current.position.x -= speed * delta; // Regreso
        if (particleRef.current.position.x <= -5) {
          particleRef.current.position.x = -5;
          reachDestination('RENDERING', 'FRONTEND_RENDER');
        }
        break;
      default:
        particleRef.current.visible = false;
        particleRef.current.position.set(-5, 0, 0); // reset
        break;
    }

    const material = particleRef.current.material as THREE.MeshBasicMaterial;
    material.color.set(particleColor.current);
  });

  return (
    <Sphere ref={particleRef} args={[0.3, 16, 16]} position={[-5, 0, 0]} visible={false}>
      <meshBasicMaterial color="#00f3ff" />
    </Sphere>
  );
}

export const Scene = () => {
  return (
    <group>
      <FrontendNode position={[-5, 0, 0]} />
      <BackendNode position={[0, 0, 0]} />
      <DatabaseNode position={[5, 0, 0]} />
      <DataParticles />
    </group>
  );
};

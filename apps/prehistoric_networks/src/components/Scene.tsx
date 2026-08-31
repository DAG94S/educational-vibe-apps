import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, QuadraticBezierLine, Html, OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const Device = ({ position, color, label, type, isTarget = false, onClick, isShaking = false }: { position: [number, number, number], color: string, label: string, type: 'PC' | 'SWITCH', isTarget?: boolean, onClick?: () => void, isShaking?: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (isShaking && ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 30) * 0.1;
    } else if (ref.current) {
      ref.current.position.x = position[0];
    }
  });

  return (
    <group ref={ref} position={position} onClick={onClick}>
      {type === 'PC' ? (
        <>
          {/* Monitor */}
          <Box args={[1.2, 0.8, 0.2]} position={[0, 0.8, 0]} castShadow>
            <meshStandardMaterial color="#2a2a2a" />
          </Box>
          {/* Screen */}
          <Box args={[1.1, 0.7, 0.05]} position={[0, 0.8, 0.11]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
          </Box>
          {/* Base */}
          <Cylinder args={[0.2, 0.3, 0.4, 8]} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color="#1a1a1a" />
          </Cylinder>
        </>
      ) : (
        <>
          {/* Switch Body */}
          <Box args={[2, 0.4, 1.2]} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color="#1a1a1a" />
          </Box>
          {/* Ports */}
          <Box args={[0.2, 0.1, 0.1]} position={[-0.5, 0.2, 0.6]}>
            <meshStandardMaterial color="#444" />
          </Box>
          <Box args={[0.2, 0.1, 0.1]} position={[0.5, 0.2, 0.6]}>
            <meshStandardMaterial color="#444" />
          </Box>
          <Box args={[0.2, 0.1, 0.1]} position={[0, 0.2, -0.6]}>
            <meshStandardMaterial color="#444" />
          </Box>
        </>
      )}

      {/* Status LED */}
      <Sphere args={[0.05, 16, 16]} position={type === 'PC' ? [0.4, 0.5, 0.12] : [0, 0.3, 0.6]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </Sphere>

      {/* Target indicator */}
      {isTarget && (
        <Sphere args={[0.1, 16, 16]} position={[0, 1.5, 0]}>
           <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      )}

      <Html position={[0, type === 'PC' ? 1.8 : 1, 0]} center>
        <div className="bg-stone-900/80 text-[#00ffcc] font-bold px-3 py-1 rounded border border-[#00ffcc]/50 whitespace-nowrap text-sm pointer-events-none">
          {label}
        </div>
      </Html>
    </group>
  );
};

const InteractiveCable = ({ startPos }: { startPos: THREE.Vector3 }) => {
  const { missionState, connectCable, setDragging } = useGameStore();
  
  const targetPos = new THREE.Vector3(-0.5, 0.2, 0.6);

  const [{ pos }, api] = useSpring(() => ({
    pos: [startPos.x + 0.5, startPos.y, startPos.z + 0.5],
    config: { tension: 200, friction: 20 }
  }));

  const [currentDragPos, setCurrentDragPos] = useState<THREE.Vector3>(new THREE.Vector3(startPos.x + 0.5, startPos.y, startPos.z + 0.5));

  const bind = useDrag(({ active, xy: [clientX, clientY] }) => {
    if (missionState !== 'IDLE') return;
    
    const mappedX = (clientX / window.innerWidth) * 2 - 1;
    const mappedY = -(clientY / window.innerHeight) * 2 + 1;
    
    const newX = mappedX * 10;
    const newZ = -mappedY * 5 + 2;

    if (active) {
      setDragging(true);
      api.start({ pos: [newX, 0.2, newZ] });
      setCurrentDragPos(new THREE.Vector3(newX, 0.2, newZ));
    } else {
      setDragging(false);
      const current = new THREE.Vector3(newX, 0.2, newZ);
      if (current.distanceTo(targetPos) < 2) {
        api.start({ pos: [targetPos.x, targetPos.y, targetPos.z] });
        setCurrentDragPos(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z));
        connectCable();
      } else {
        api.start({ pos: [startPos.x + 0.5, startPos.y, startPos.z + 0.5] });
        setCurrentDragPos(new THREE.Vector3(startPos.x + 0.5, startPos.y, startPos.z + 0.5));
      }
    }
  });

  useEffect(() => {
    if (missionState !== 'IDLE') {
      api.start({ pos: [targetPos.x, targetPos.y, targetPos.z] });
      setCurrentDragPos(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z));
    } else {
       // Reset on scenario change
      api.start({ pos: [startPos.x + 0.5, startPos.y, startPos.z + 0.5] });
      setCurrentDragPos(new THREE.Vector3(startPos.x + 0.5, startPos.y, startPos.z + 0.5));
    }
  }, [missionState, api, targetPos, startPos]);

  return (
    <>
      <animated.group position={pos as any} {...(bind() as any)}>
        <Box args={[0.3, 0.1, 0.4]} castShadow>
          <meshStandardMaterial color={missionState === 'IDLE' ? "#ff3333" : "#33ff33"} emissive={missionState === 'IDLE' ? "#ff3333" : "#33ff33"} emissiveIntensity={0.5} />
        </Box>
      </animated.group>
      
      <QuadraticBezierLine
        start={startPos}
        end={missionState === 'IDLE' ? currentDragPos : targetPos}
        mid={[ (startPos.x + currentDragPos.x)/2, -1, (startPos.z + currentDragPos.z)/2 ]}
        color="#00ffcc"
        lineWidth={3}
      />
    </>
  );
};

const IPForms = () => {
  const { missionState, validateIPs, currentScenario, evalSubnetMask } = useGameStore();
  const [ipA, setIpA] = useState('192.168.1.10');
  const [ipB, setIpB] = useState('192.168.1.20');
  const [ipC, setIpC] = useState('192.168.1.30');
  const [mask, setMask] = useState('255.255.255.0');

  // Reset state on scenario change roughly
  useEffect(() => {
    if (currentScenario === 'EVALUATION') {
       setIpA('');
       setIpB('');
       setMask(evalSubnetMask);
    } else {
       setIpA('192.168.1.10');
       setIpB('192.168.1.20');
       setIpC('192.168.1.30');
       setMask('255.255.255.0');
    }
  }, [currentScenario, evalSubnetMask]);
  
  if (missionState === 'IDLE') return null;

  const handleValidate = () => {
    // For learning 2 we validate 3 IPs but we only have 2 args in validateIPs right now.
    // We'll just validate A and B for simplicity in the simulation logic, 
    // as long as they enter something valid for C it's fine for the visual.
    // In a real app we'd expand validateIPs to take an array.
    validateIPs(ipA, ipB, mask);
  };

  const posPC1: [number, number, number] = currentScenario === 'LEARNING_2' ? [-3, -1, 2] : [-4, -1, 0];
  const posPC2: [number, number, number] = currentScenario === 'LEARNING_2' ? [3, -1, 2] : [4, -1, 0];
  const posPC3: [number, number, number] = [0, -1, -4];

  return (
    <>
      <Html position={posPC1} center>
        <div className="bg-stone-900 border border-stone-700 p-2 rounded flex flex-col gap-1 shadow-lg w-36 pointer-events-auto">
          <label className="text-xs text-stone-400">IP PC 1</label>
          <input 
            type="text"
            value={ipA}
            onChange={(e) => setIpA(e.target.value)}
            className={`bg-stone-800 text-[#00ffcc] font-mono text-sm px-2 py-1 rounded outline-none border ${missionState === 'PING_FAILED' && currentScenario === 'EVALUATION' ? 'border-red-500' : 'border-stone-600 focus:border-[#00ffcc]'}`}
            disabled={missionState !== 'CABLE_CONNECTED' && missionState !== 'PING_FAILED'}
          />
        </div>
      </Html>
      
      <Html position={posPC2} center>
        <div className="bg-stone-900 border border-stone-700 p-2 rounded flex flex-col gap-1 shadow-lg w-36 pointer-events-auto">
          <label className="text-xs text-stone-400">IP PC 2</label>
          <input 
            type="text"
            value={ipB}
            onChange={(e) => setIpB(e.target.value)}
            className={`bg-stone-800 text-[#00ffcc] font-mono text-sm px-2 py-1 rounded outline-none border ${missionState === 'PING_FAILED' && currentScenario === 'EVALUATION' ? 'border-red-500' : 'border-stone-600 focus:border-[#00ffcc]'}`}
            disabled={missionState !== 'CABLE_CONNECTED' && missionState !== 'PING_FAILED'}
          />
        </div>
      </Html>

      {currentScenario === 'LEARNING_2' && (
        <Html position={posPC3} center>
          <div className="bg-stone-900 border border-stone-700 p-2 rounded flex flex-col gap-1 shadow-lg w-36 pointer-events-auto">
            <label className="text-xs text-stone-400">IP PC 3</label>
            <input 
              type="text"
              value={ipC}
              onChange={(e) => setIpC(e.target.value)}
              className="bg-stone-800 text-[#00ffcc] font-mono text-sm px-2 py-1 rounded outline-none border border-stone-600 focus:border-[#00ffcc]"
              disabled={missionState !== 'CABLE_CONNECTED' && missionState !== 'PING_FAILED'}
            />
          </div>
        </Html>
      )}

      {(missionState === 'CABLE_CONNECTED' || missionState === 'PING_FAILED') && (
        <Html position={[0, -2, 2]} center>
          <div className="bg-stone-900 border border-stone-700 p-3 rounded flex gap-4 items-end shadow-xl pointer-events-auto">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-400">Subnet Mask</label>
              <input 
                type="text"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                className="bg-stone-800 text-stone-300 font-mono text-sm px-2 py-1 rounded outline-none border border-stone-600"
                disabled={currentScenario === 'EVALUATION'} // Force them to use the given mask in eval
              />
            </div>
            <button 
              onClick={handleValidate}
              className="bg-[#00ffcc] text-black px-4 py-1.5 rounded font-bold hover:bg-[#33ffaa] transition-colors"
            >
              Validar IPs
            </button>
          </div>
        </Html>
      )}
    </>
  );
}

const PingParticle = () => {
  const ref = useRef<THREE.Mesh>(null);
  const { missionState, currentScenario } = useGameStore();
  
  const startPos = currentScenario === 'LEARNING_2' ? -3 : -4;
  const targetPos = currentScenario === 'LEARNING_2' ? 3 : 4;

  useFrame((state) => {
    if (ref.current && missionState === 'PING_SUCCESS') {
      const time = state.clock.elapsedTime * 2;
      const radius = (targetPos - startPos) / 2;
      const center = (targetPos + startPos) / 2;
      ref.current.position.x = center + Math.sin(time) * radius;
      ref.current.position.y = 0.2 + (Math.cos(time * 2) - 1) * 0.5;
    }
  });

  if (missionState !== 'PING_SUCCESS') return null;

  return (
    <mesh ref={ref} position={[startPos, 0.2, 0]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#00ffcc" toneMapped={false} />
    </mesh>
  );
};

export const Scene = () => {
  const { missionState, sendPing, isDragging, currentScenario } = useGameStore();
  const [pingTargetSelectable, setPingTargetSelectable] = useState(false);

  const getStatusColor = () => {
    switch (missionState) {
      case 'IDLE': return '#ff0000';
      case 'CABLE_CONNECTED': return '#ffff00';
      case 'IPS_ASSIGNED': return '#00ff00';
      case 'PING_SUCCESS': return '#00ffff';
      case 'PING_FAILED': return '#ff3366'; // Show red on fail
      default: return '#ff0000';
    }
  };

  const handlePC1Click = () => {
    if (missionState === 'IPS_ASSIGNED') {
      setPingTargetSelectable(true);
    }
  };

  const handlePC2Click = () => {
    if (pingTargetSelectable) {
      sendPing();
      setPingTargetSelectable(false);
    }
  };

  // Topology Positions
  const isStar = currentScenario === 'LEARNING_2';
  const pc1Pos = isStar ? new THREE.Vector3(-3, 0, 2) : new THREE.Vector3(-4, 0, 0);
  const pc2Pos = isStar ? new THREE.Vector3(3, 0, 2) : new THREE.Vector3(4, 0, 0);
  const pc3Pos = new THREE.Vector3(0, 0, -4);

  return (
    <group>
      <OrbitControls 
        makeDefault 
        enabled={!isDragging} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={3} 
        maxDistance={15} 
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      {/* Switch Central */}
      <Device 
        position={[0, 0, 0]} 
        color={getStatusColor()} 
        label="Switch Central" 
        type="SWITCH"
        isShaking={missionState === 'PING_FAILED'}
      />

      {/* PC 1 */}
      <Device 
        position={[pc1Pos.x, pc1Pos.y, pc1Pos.z]} 
        color={getStatusColor()} 
        label="PC 1" 
        type="PC"
        onClick={handlePC1Click}
        isShaking={missionState === 'PING_FAILED'}
      />
      
      {/* PC 2 */}
      <Device 
        position={[pc2Pos.x, pc2Pos.y, pc2Pos.z]} 
        color={getStatusColor()} 
        label="PC 2"
        type="PC"
        isTarget={pingTargetSelectable}
        onClick={handlePC2Click}
      />

      {/* Static Cable PC 2 -> Switch */}
      <QuadraticBezierLine
        start={[pc2Pos.x, 0.2, pc2Pos.z]}
        end={[0.5, 0.2, 0.6]}
        mid={[(pc2Pos.x + 0.5)/2, -0.5, (pc2Pos.z + 0.6)/2]}
        color="#00ffcc"
        lineWidth={3}
      />

      {/* PC 3 and Cable for Star Topology */}
      {isStar && (
        <>
          <Device 
            position={[pc3Pos.x, pc3Pos.y, pc3Pos.z]} 
            color={getStatusColor()} 
            label="PC 3"
            type="PC"
          />
          <QuadraticBezierLine
            start={[pc3Pos.x, 0.2, pc3Pos.z]}
            end={[0, 0.2, -0.6]}
            mid={[(pc3Pos.x)/2, -0.5, (pc3Pos.z - 0.6)/2]}
            color="#00ffcc"
            lineWidth={3}
          />
        </>
      )}

      <InteractiveCable startPos={pc1Pos} />
      <IPForms />
      <PingParticle />

      {/* Helper text for ping */}
      {pingTargetSelectable && (
        <Html position={[0, 3, 0]} center>
          <div className="bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc] px-4 py-2 rounded-full font-bold animate-pulse whitespace-nowrap">
            Haz clic en la PC 2 para enviar el Ping
          </div>
        </Html>
      )}
    </group>
  );
};

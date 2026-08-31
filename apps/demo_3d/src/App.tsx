import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Scene } from './components/Scene';
import { ControlPanel } from './components/UI/ControlPanel';

function App() {
  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden relative font-sans">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
        
        <Scene />
        
        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={5} maxDistance={25} />
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={1.5} 
          />
          <ChromaticAberration 
            blendFunction={BlendFunction.NORMAL} 
            offset={[0.002, 0.002]} 
          />
        </EffectComposer>
      </Canvas>
      
      <ControlPanel />
    </div>
  );
}

export default App;

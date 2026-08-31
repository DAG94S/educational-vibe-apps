import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Scene } from './components/Scene';
import { ControlPanel } from './components/UI/ControlPanel';

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 5, 8], fov: 50 }}>
        <color attach="background" args={['#1a1a1a']} />
        <Scene />
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
      </Canvas>
      <ControlPanel />
    </div>
  );
}

export default App;

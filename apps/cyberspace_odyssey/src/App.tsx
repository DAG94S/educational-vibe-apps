import { Scene } from './components/Scene';
import { ControlPanel } from './components/UI/ControlPanel';

function App() {
  return (
    <div className="w-screen h-screen relative bg-cyber-bg overflow-hidden">
      <Scene />
      <ControlPanel />
    </div>
  )
}

export default App

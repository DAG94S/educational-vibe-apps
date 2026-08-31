import React, { useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderStats } from './components/HeaderStats';
import { SidebarControls } from './components/SidebarControls';
import { ConsolePanel } from './components/ConsolePanel';
import { EduModal } from './components/EduModal';
import { TutorialModal } from './components/TutorialModal';
import { VictoryModal } from './components/VictoryModal';
import { useEnigmaStore } from './store/enigmaStore';

function App() {
  const decrementTime = useEnigmaStore((state) => state.decrementTime);

  // Timer countdown hook
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [decrementTime]);

  return (
    <>
      {/* 3D WebGL Canvas Viewport */}
      <ThreeCanvas />

      {/* OrbitControls Tips */}
      <div className="camera-tips">
        Arrastrá para rotar | Rueda para zoom | Click secundario para desplazar
      </div>

      {/* Interactive HUD Overlays */}
      <div id="ui-overlay">
        <HeaderStats />

        <main className="main-dashboard">
          <SidebarControls />
          <ConsolePanel />
        </main>
      </div>

      {/* Educational modal */}
      <EduModal />

      {/* Welcoming Narrative Tutorial Modal */}
      <TutorialModal />

      {/* Final Success victory screen */}
      <VictoryModal />
    </>
  );
}

export default App;

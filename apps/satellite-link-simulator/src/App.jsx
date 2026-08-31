import React, { useEffect, useState } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ControlPanel } from './components/ControlPanel';
import { TelemetryHUD } from './components/TelemetryHUD';
import './index.css';

function LiveClock() {
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="header-clock">{time} UTC</div>;
}

function App() {
  return (
    <div className="app-root">
      <ThreeCanvas />

      <div className="ui-overlay">
        {/* ── Top Bar ── */}
        <header className="top-bar">
          <div className="header-brand">
            <span className="header-icon">🛰️</span>
            <div className="header-text">
              <h1>Satellite Link Simulator</h1>
              <p>Comunicaciones Satelitales — ESPOCH · P0045 · 2026</p>
            </div>
          </div>

          <div className="header-center">
            <div className="header-badge"><span className="dot dot-green" /> LEO 550–750 km</div>
            <div className="header-badge"><span className="dot dot-red"   /> GEO 35,786 km</div>
            <div className="header-badge"><span className="dot dot-cyan"  /> Ground Station</div>
          </div>

          <LiveClock />
        </header>

        {/* ── Left: Control Panel ── */}
        <aside className="sidebar-left">
          <ControlPanel />
        </aside>

        {/* ── Right: Telemetry ── */}
        <aside className="sidebar-right">
          <TelemetryHUD />
        </aside>

        {/* ── Footer ── */}
        <footer className="camera-tips">
          Drag to rotate&nbsp;·&nbsp;Scroll to zoom&nbsp;·&nbsp;Right-click to pan
        </footer>
      </div>
    </div>
  );
}

export default App;

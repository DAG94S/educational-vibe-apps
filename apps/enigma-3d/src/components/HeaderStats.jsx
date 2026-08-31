import React from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function HeaderStats() {
  const xp = useEnigmaStore((state) => state.xp);
  const room = useEnigmaStore((state) => state.currentRoom);
  const timeRemaining = useEnigmaStore((state) => state.timeRemaining);

  // Formato MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const isTimeCritical = timeRemaining <= 10 * 60; // menos de 10 min

  return (
    <header className="top-bar">
      <div className="title-section glass-panel interactive-ui">
        <h1>Operación Ulises</h1>
        <p>Búnker del Enigma • Flipped Lab</p>
      </div>
      
      <div className="stats-bar glass-panel interactive-ui">
        <div className="stat-box">
          <span className="stat-label">Tiempo Restante</span>
          <span id="timer-val" className={`stat-value ${isTimeCritical ? 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Créditos Turing</span>
          <span className="stat-value">{xp} XP</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Sala</span>
          <span className="stat-value">{room} / 3</span>
        </div>
      </div>
    </header>
  );
}

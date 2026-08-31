import React from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function VictoryModal() {
  const isVictory = useEnigmaStore((state) => state.finalVictory);
  const xp = useEnigmaStore((state) => state.xp);
  const timeRemaining = useEnigmaStore((state) => state.timeRemaining);

  if (!isVictory) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="modal-backdrop active" style={{ zIndex: 300, background: 'rgba(0,0,0,0.85)' }}>
      <div className="modal-box" style={{ maxWidth: '500px', border: '2px solid var(--color-glow)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
        <h2 style={{ color: 'var(--color-glow)', fontFamily: 'var(--font-title)', textTransform: 'uppercase', fontSize: '1.6rem', letterSpacing: '1px', marginBottom: '12px' }}>
          ¡Operación Ulises Completada!
        </h2>
        
        <div className="modal-body" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p>Has descifrado la transmisión militar interceptada a tiempo. Bletchley Park ha recibido las coordenadas correctas gracias a tu análisis de modularidad y permisión de Enigma.</p>
          
          <div style={{
            background: 'rgba(0, 180, 120, 0.05)',
            border: '1px solid rgba(0, 180, 120, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            margin: '20px 0',
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Créditos Obtenidos</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--color-glow)', fontFamily: 'var(--font-mono)' }}>+{xp} XP</strong>
            </div>
            <div style={{ borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '24px' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Tiempo Sobrante</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--color-glow-secondary)', fontFamily: 'var(--font-mono)' }}>{formatTime(timeRemaining)}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
            Tu reporte de laboratorio individual ha sido sincronizado exitosamente con la plataforma virtual Moodle.
          </p>

          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Jugar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

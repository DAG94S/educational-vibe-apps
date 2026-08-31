import React from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function TutorialModal() {
  const completed = useEnigmaStore((state) => state.tutorialCompleted);
  const completeTutorial = useEnigmaStore((state) => state.completeTutorial);

  if (completed) return null;

  return (
    <div className="modal-backdrop active" style={{ zIndex: 200 }}>
      <div className="modal-box" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2>Operación Ulises: El Búnker del Enigma</h2>
        </div>
        <div className="modal-body" style={{ fontSize: '0.95rem' }}>
          <p><strong>¡Atención Agente!</strong> Te encuentras en un búnker de descifrado militar de la Segunda Guerra Mundial. Hemos interceptado una comunicación enemiga crucial:</p>
          
          <div style={{
            background: 'rgba(0,0,0,0.05)',
            border: '1px dashed var(--color-glow-secondary)',
            padding: '12px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            letterSpacing: '2px',
            borderRadius: '8px',
            margin: '16px 0',
            color: 'var(--color-glow-secondary)',
            fontWeight: 'bold'
          }}>
            "HOYSEDECIDEELDETALLE"
          </div>
          
          <p>El motor de descifrado está dañado y dividido en 3 módulos interactivos. Debes reparar cada módulo completando la misión asignada para desbloquear la salida del laboratorio.</p>
          
          <div style={{
            background: 'rgba(0, 180, 120, 0.05)',
            border: '1px solid var(--border-glow)',
            padding: '14px',
            borderRadius: '8px',
            margin: '16px 0'
          }}>
            <h4 style={{ color: 'var(--color-glow)', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Instrucciones de Supervivencia:
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <li style={{ marginBottom: '6px' }}><strong>Interactúa en 3D</strong>: Arrastrá con el mouse para rotar la máquina y haz click en las clavijas, rotores y reflector.</li>
              <li style={{ marginBottom: '6px' }}><strong>Checklist de Misión</strong>: Revisá el panel lateral izquierdo para ver los objetivos pendientes.</li>
              <li style={{ marginBottom: '6px' }}><strong>Progresión por mérito</strong>: Solo podrás avanzar a la siguiente sala cuando todas las tareas tengan un check verde.</li>
            </ul>
          </div>
          
          <button className="btn btn-primary" onClick={completeTutorial} style={{ marginTop: '12px' }}>
            Iniciar Descifrado
          </button>
        </div>
      </div>
    </div>
  );
}

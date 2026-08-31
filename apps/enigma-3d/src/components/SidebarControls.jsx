import React from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function SidebarControls() {
  const positions = useEnigmaStore((state) => state.positions);
  const ringSettings = useEnigmaStore((state) => state.ringSettings);
  const plugboardPairs = useEnigmaStore((state) => state.plugboardPairs);
  const currentRoom = useEnigmaStore((state) => state.currentRoom);
  const roomTasks = useEnigmaStore((state) => state.roomTasks);
  const resetMachine = useEnigmaStore((state) => state.resetMachine);
  const setRoom = useEnigmaStore((state) => state.setRoom);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Obtener nombre del rol
  const getRoleName = () => {
    if (currentRoom === 1) return 'OPERADOR DE CABLES';
    if (currentRoom === 2) return 'INGENIERO DE ROTORES';
    return 'CRIPTOMATEMÁTICO';
  };

  // Obtener objetivos y su estado de cumplimiento reactivo
  const getMissionObjective = () => {
    const tasks = roomTasks[currentRoom];
    if (currentRoom === 1) {
      return {
        title: "Sala 1: Puentes del Clavijero",
        steps: [
          { label: "Hacer click en dos clavijas 3D para conectar un cable.", done: tasks.plugboardConnected },
          { label: "Responder correctamente el quiz de simetría en el modal.", done: tasks.quizSolved }
        ],
        completed: tasks.completed
      };
    }
    if (currentRoom === 2) {
      return {
        title: "Sala 2: Calibración de Rotores",
        steps: [
          { label: "Hacer click en un rotor 3D en el eje de la máquina.", done: tasks.rotorClicked },
          { label: "Responder correctamente el quiz del doble paso mecánico.", done: tasks.quizSolved }
        ],
        completed: tasks.completed
      };
    }
    return {
      title: "Sala 3: Tránsito del Reflector",
      steps: [
        { label: "Hacer click en el reflector metálico a la izquierda.", done: tasks.reflectorClicked },
        { label: "Responder correctamente el quiz teórico del reflector.", done: tasks.quizSolved },
        { label: "Tipear 'HOYSEDECIDEELDETALLE' en la consola y procesar.", done: tasks.messageDecrypted }
      ],
      completed: tasks.completed
    };
  };

  const posString = positions.map(p => alphabet[p]).join(' ');
  const ringString = ringSettings.map(r => alphabet[r]).join(' ');
  const mission = getMissionObjective();

  const handleNextRoom = () => {
    if (!mission.completed) return;
    const next = (currentRoom % 3) + 1;
    setRoom(next);
  };

  return (
    <section className="control-column glass-panel interactive-ui">
      <div className="panel-header">
        <span className="role-badge">{getRoleName()}</span>
        <h3 className="panel-title" style={{ marginTop: '12px' }}>Ajustes de Cifrado</h3>
      </div>
      <p className="description-text">Configurá la máquina Enigma resolviendo los objetivos en 3D.</p>
      
      <div className="config-group">
        <div className="config-row">
          <span>Rotores</span>
          <div className="rotors-selector">
            <div className="rotor-select-btn">I</div>
            <div className="rotor-select-btn">II</div>
            <div className="rotor-select-btn">III</div>
          </div>
        </div>
        <div className="config-row">
          <span>Posición Inicial</span>
          <strong>{posString}</strong>
        </div>
        <div className="config-row">
          <span>Anillo (Ring)</span>
          <strong>{ringString}</strong>
        </div>
        <div className="config-row">
          <span>Plugboard</span>
          <strong>{plugboardPairs.length > 0 ? plugboardPairs.join(' ') : 'Sin Conexiones'}</strong>
        </div>
      </div>

      {/* Explicatory Room Missions Interactive Checklist */}
      <div className="mission-panel">
        <h4 className="mission-title" style={{ color: mission.completed ? 'var(--color-glow)' : 'var(--color-glow-secondary)' }}>
          <span>{mission.completed ? '✅ Misión Completada' : '📋 Misión Activa'}</span>
        </h4>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: 'bold' }}>
          {mission.title}
        </div>
        {mission.steps.map((step, idx) => (
          <div key={idx} className="mission-step" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: step.done ? 'var(--color-glow)' : 'var(--color-glow-error)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {step.done ? '✓' : '○'}
            </span>
            <span style={{ textDecoration: step.done ? 'line-through' : 'none', color: step.done ? 'var(--color-muted)' : 'var(--color-text)' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={resetMachine} style={{ marginTop: '12px' }}>
        Reiniciar Máquina
      </button>
      
      <button 
        className="btn" 
        onClick={handleNextRoom} 
        disabled={!mission.completed}
        style={{ 
          marginTop: '4px',
          opacity: mission.completed ? 1 : 0.4,
          cursor: mission.completed ? 'pointer' : 'not-allowed',
          borderColor: mission.completed ? 'var(--color-glow-secondary)' : 'rgba(0,0,0,0.08)'
        }}
      >
        {mission.completed ? 'Siguiente Sala →' : 'Bloqueado (Completá la misión)'}
      </button>
    </section>
  );
}

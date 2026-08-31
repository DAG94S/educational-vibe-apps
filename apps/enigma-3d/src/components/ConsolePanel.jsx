import React, { useState, useRef, useEffect } from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function ConsolePanel() {
  const logs = useEnigmaStore((state) => state.consoleLogs);
  const cryptText = useEnigmaStore((state) => state.cryptText);
  const [inputValue, setInputValue] = useState('');
  const consoleEndRef = useRef(null);

  const handleProcess = () => {
    if (!inputValue.trim()) return;
    cryptText(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleProcess();
    }
  };

  // Auto scroll to bottom when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <section className="console-column glass-panel interactive-ui">
      <h3 className="panel-title">
        <span>Decriptador de Radio</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
          ONLINE
        </span>
      </h3>
      
      {/* Live Output Log */}
      <div className="console-box" style={{ flex: 1, overflowY: 'auto' }}>
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`console-line ${log.type}`}
            dangerouslySetInnerHTML={{ __html: log.text }}
          />
        ))}
        <div ref={consoleEndRef} />
      </div>

      {/* Input controls */}
      <div className="input-container">
        <input 
          type="text" 
          className="text-input" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tipeá un texto para procesar..."
          autoComplete="off"
        />
        <button className="btn" onClick={handleProcess} style={{ width: 'auto' }}>
          Procesar
        </button>
      </div>
    </section>
  );
}

import React, { useEffect, useRef } from 'react';
import { Enigma3DScene } from '../3d/Enigma3DScene';

export function ThreeCanvas() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      sceneRef.current = new Enigma3DScene(containerRef.current);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy(); // Strict resource cleanup to prevent memory leaks
        sceneRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="canvas-container" 
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }} 
    />
  );
}

import React, { useEffect, useRef } from 'react';
import { SatelliteScene } from '../3d/SatelliteScene';

export function ThreeCanvas() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      sceneRef.current = new SatelliteScene(containerRef.current);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="canvas-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 1 
      }} 
    />
  );
}

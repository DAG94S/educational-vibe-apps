import React from 'react';
import { useLinkStore } from '../store/useLinkStore';

export function TelemetryHUD() {
  const {
    distance,
    latency,
    pathLoss,
    snr,
    linkStatus
  } = useLinkStore();

  const getStatusColorClass = () => {
    switch (linkStatus) {
      case 'Stable': return 'status-stable';
      case 'Degraded': return 'status-degraded';
      case 'Interrupted': return 'status-interrupted';
      default: return '';
    }
  };

  const getStatusLabel = () => {
    switch (linkStatus) {
      case 'Stable': return 'ENLACE ESTABLE (Óptimo)';
      case 'Degraded': return 'ENLACE DEGRADADO (Pérdidas)';
      case 'Interrupted': return 'ENLACE CAÍDO (Sin Señal)';
      default: return '';
    }
  };

  return (
    <div className="telemetry-hud glassmorphism">
      <div className="panel-header">
        <h2>Telemetría en Tiempo Real</h2>
        <div className={`status-pill ${getStatusColorClass()}`}>
          {getStatusLabel()}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Distancia de Propagación</span>
          <span className="metric-value">{distance.toLocaleString()} km</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Retardo de Ida (Latencia)</span>
          <span className="metric-value">{latency} ms</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Pérdida en Espacio Libre (FSPL)</span>
          <span className="metric-value text-red">{pathLoss} dB</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Relación Señal/Ruido (SNR)</span>
          <span className={`metric-value ${snr >= 15 ? 'text-green' : snr >= 10 ? 'text-orange' : 'text-red'}`}>
            {snr} dB
          </span>
        </div>
      </div>

      <div className="hud-chart-container">
        <label>Calidad del Enlace (SNR)</label>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${getStatusColorClass()}`}
            style={{ width: `${Math.min(Math.max((snr / 40) * 100, 5), 100)}%` }}
          />
        </div>
        <div className="chart-labels">
          <span>0 dB (Ruido)</span>
          <span>15 dB (Umbral)</span>
          <span>40 dB (Excelente)</span>
        </div>
      </div>
    </div>
  );
}

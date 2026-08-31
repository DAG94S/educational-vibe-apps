import React from 'react';
import { useLinkStore, GROUND_STATIONS, FREQ_BANDS } from '../store/useLinkStore';

export function ControlPanel() {
  const {
    orbitType, frequencyBand, transponderType, weather, activeGroundStation,
    setOrbitType, setFrequencyBand, setTransponderType, setWeather, setActiveGroundStation
  } = useLinkStore();

  return (
    <div className="glass">
      <div className="panel-head">
        <h2>⚙ Configuration</h2>
        <p className="sub">Link Parameters &amp; Orbital Setup</p>
      </div>

      {/* ── Orbit Type ── */}
      <div className="ctrl-group">
        <span className="ctrl-label">Orbit Type</span>
        <div className="btn-row">
          <button
            className={`ctrl-btn var-green${orbitType === 'LEO' ? ' active' : ''}`}
            onClick={() => setOrbitType('LEO')}
          >
            <span className="btn-title">🟢 LEO</span>
            <span className="btn-detail">550–750 km · 6 sats</span>
          </button>
          <button
            className={`ctrl-btn var-red${orbitType === 'GEO' ? ' active' : ''}`}
            onClick={() => setOrbitType('GEO')}
          >
            <span className="btn-title">🔴 GEO</span>
            <span className="btn-detail">35,786 km · 3 sats</span>
          </button>
        </div>
        <p className="info-callout">
          {orbitType === 'LEO'
            ? '↗ Low latency (~2 ms). High revisit rate. Multiple inclined orbital planes.'
            : '↗ Fixed position. Continuous coverage. High propagation delay (~119 ms).'}
        </p>
      </div>

      {/* ── Frequency Band ── */}
      <div className="ctrl-group">
        <span className="ctrl-label">Frequency Band</span>
        <div className="btn-row cols-3">
          {Object.entries(FREQ_BANDS).map(([key, band]) => (
            <button
              key={key}
              className={`ctrl-btn var-cyan${frequencyBand === key ? ' active' : ''}`}
              onClick={() => setFrequencyBand(key)}
            >
              <span className="btn-title">Band {key}</span>
              <span className="btn-detail">{band.freq} GHz</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Weather ── */}
      <div className="ctrl-group">
        <span className="ctrl-label">Weather Conditions</span>
        <div className="btn-row">
          <button
            className={`ctrl-btn var-yellow${weather === 'clear' ? ' active' : ''}`}
            onClick={() => setWeather('clear')}
          >
            <span className="btn-title">☀ Clear Sky</span>
            <span className="btn-detail">No attenuation</span>
          </button>
          <button
            className={`ctrl-btn var-blue${weather === 'rain' ? ' active' : ''}`}
            onClick={() => setWeather('rain')}
          >
            <span className="btn-title">🌧 Heavy Rain</span>
            <span className="btn-detail">Rain fade active</span>
          </button>
        </div>
        {weather === 'rain' && frequencyBand !== 'C' && (
          <div className="warning-callout">
            ⚠ Rain attenuation: −{FREQ_BANDS[frequencyBand].rainLoss} dB on Band {frequencyBand}.
            C-band is immune to rain fade.
          </div>
        )}
      </div>

      {/* ── Transponder ── */}
      <div className="ctrl-group">
        <span className="ctrl-label">Transponder Architecture</span>
        <div className="btn-row">
          <button
            className={`ctrl-btn${transponderType === 'transparent' ? ' active' : ''}`}
            onClick={() => setTransponderType('transparent')}
          >
            <span className="btn-title">↺ Transparent</span>
            <span className="btn-detail">Analog U-curve</span>
          </button>
          <button
            className={`ctrl-btn var-violet${transponderType === 'regenerative' ? ' active' : ''}`}
            onClick={() => setTransponderType('regenerative')}
          >
            <span className="btn-title">⚡ Regenerative</span>
            <span className="btn-detail">Digital +3 dB</span>
          </button>
        </div>
        <p className="info-callout">
          {transponderType === 'regenerative'
            ? 'On-board demodulation cleans uplink noise before retransmission. Net SNR gain: +3 dB.'
            : 'Signal retransmitted as-is with amplification. Noise compounds in both links.'}
        </p>
      </div>

      {/* ── Ground Station ── */}
      <div className="ctrl-group">
        <span className="ctrl-label">Active Ground Station</span>
        <select
          className="ctrl-select"
          value={activeGroundStation}
          onChange={e => setActiveGroundStation(e.target.value)}
        >
          {Object.entries(GROUND_STATIONS).map(([key, data]) => (
            <option key={key} value={key}>{data.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

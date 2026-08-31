import { create } from 'zustand';

export const GROUND_STATIONS = {
  ESPOCH: { lat: -1.658, lon: -78.677, name: 'ESPOCH (Ecuador)' },
  Antarctica: { lat: -82.862, lon: 135.0, name: 'Base Antártida' },
  Pacific: { lat: 0.0, lon: -120.0, name: 'Buque Pacífico' }
};

export const FREQ_BANDS = {
  C: { name: 'Banda C', freq: 4.0, rainLoss: 0.0, txPower: 30 }, // GHz, dB, dBm
  Ku: { name: 'Banda Ku', freq: 12.0, rainLoss: 3.5, txPower: 35 },
  Ka: { name: 'Banda Ka', freq: 20.0, rainLoss: 10.0, txPower: 40 }
};

export const useLinkStore = create((set, get) => ({
  orbitType: 'LEO', // 'LEO' | 'GEO'
  frequencyBand: 'C', // 'C' | 'Ku' | 'Ka'
  transponderType: 'transparent', // 'transparent' | 'regenerative'
  weather: 'clear', // 'clear' | 'rain'
  activeGroundStation: 'ESPOCH',

  // Calculated metrics
  distance: 600, // km
  latency: 2.0, // ms (one-way)
  pathLoss: 0, // dB
  snr: 0, // dB
  linkStatus: 'Stable', // 'Stable' | 'Degraded' | 'Interrupted'

  setOrbitType: (type) => {
    set({ orbitType: type });
    get().recalculatePhysics();
  },
  setFrequencyBand: (band) => {
    set({ frequencyBand: band });
    get().recalculatePhysics();
  },
  setTransponderType: (type) => {
    set({ transponderType: type });
    get().recalculatePhysics();
  },
  setWeather: (weather) => {
    set({ weather: weather });
    get().recalculatePhysics();
  },
  setActiveGroundStation: (station) => {
    set({ activeGroundStation: station });
    get().recalculatePhysics();
  },

  recalculatePhysics: () => {
    const { orbitType, frequencyBand, transponderType, weather } = get();
    
    // Orbit heights
    const orbitHeight = orbitType === 'LEO' ? 600 : 35786;
    const speedOfLight = 299792; // km/s
    const calculatedLatency = parseFloat((orbitHeight / speedOfLight * 1000).toFixed(1));

    // Free Space Path Loss (FSPL) = 20 log10(d_km) + 20 log10(f_GHz) + 92.45
    const band = FREQ_BANDS[frequencyBand];
    const fspl = 20 * Math.log10(orbitHeight) + 20 * Math.log10(band.freq) + 92.45;
    
    // Rain attenuation
    const currentRainLoss = weather === 'rain' ? band.rainLoss : 0;

    // Link Budget (SNR Estimation)
    let calculatedSnr = band.txPower - (fspl - 120) - currentRainLoss;
    
    // Regenerative transponder gains
    if (transponderType === 'regenerative') {
      calculatedSnr += 3.0; // 3dB improvement due to signal cleanup/re-modulation
    }

    // Link Status categorization
    let status = 'Stable';
    if (calculatedSnr < 10) {
      status = 'Interrupted';
    } else if (calculatedSnr < 15) {
      status = 'Degraded';
    }

    set({
      distance: orbitHeight,
      latency: calculatedLatency,
      pathLoss: parseFloat(fspl.toFixed(1)),
      snr: parseFloat(calculatedSnr.toFixed(1)),
      linkStatus: status
    });
  }
}));

// Run an initial calculation to populate metrics
useLinkStore.getState().recalculatePhysics();

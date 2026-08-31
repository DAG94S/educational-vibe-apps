import { create } from 'zustand';

export type MissionState = 'IDLE' | 'CABLE_CONNECTED' | 'IPS_ASSIGNED' | 'PING_SUCCESS' | 'PING_FAILED';
export type ScenarioType = 'LEARNING_1' | 'LEARNING_2' | 'EVALUATION';

interface GameState {
  currentScenario: ScenarioType;
  missionState: MissionState;
  isModalOpen: boolean;
  currentTheory: string | null;
  
  // Evaluation specific
  evalTargetNetwork: string;
  evalSubnetMask: string;

  // Interaction State
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;

  // Actions
  setScenario: (scenario: ScenarioType) => void;
  connectCable: () => void;
  validateIPs: (ipA: string, ipB: string, mask: string) => boolean;
  sendPing: () => void;
  closeModal: () => void;
}

// Helper to convert IP string to integer for subnet masking
const ipToInt = (ip: string) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const generateRandomNetwork = () => {
  const nets = [
    { net: '192.168.10.0', mask: '255.255.255.0' },
    { net: '172.16.0.0', mask: '255.255.0.0' },
    { net: '10.0.0.0', mask: '255.0.0.0' }
  ];
  return nets[Math.floor(Math.random() * nets.length)];
};

export const useGameStore = create<GameState>((set, get) => ({
  currentScenario: 'LEARNING_1',
  missionState: 'IDLE',
  isModalOpen: false,
  currentTheory: null,
  
  evalTargetNetwork: '192.168.10.0',
  evalSubnetMask: '255.255.255.0',

  isDragging: false,
  setDragging: (dragging) => set({ isDragging: dragging }),

  setScenario: (scenario) => {
    const newEval = scenario === 'EVALUATION' ? generateRandomNetwork() : { net: '', mask: '' };
    set({
      currentScenario: scenario,
      missionState: 'IDLE',
      isModalOpen: false,
      currentTheory: null,
      evalTargetNetwork: newEval.net,
      evalSubnetMask: newEval.mask
    });
  },

  connectCable: () => {
    if (get().missionState !== 'IDLE') return;
    const theoryContent = get().currentScenario === 'EVALUATION' ? null : 'PHYSICAL_LAYER';
    set({
      missionState: 'CABLE_CONNECTED',
      isModalOpen: theoryContent !== null,
      currentTheory: theoryContent,
    });
  },

  validateIPs: (ipA, ipB, mask) => {
    if (get().missionState !== 'CABLE_CONNECTED' && get().missionState !== 'PING_FAILED') return false;
    
    const state = get();
    try {
      const intA = ipToInt(ipA);
      const intB = ipToInt(ipB);
      const intMask = ipToInt(mask);

      let isValid = false;

      if (state.currentScenario === 'EVALUATION') {
        // Strict evaluation against random network
        const intTargetNet = ipToInt(state.evalTargetNetwork);
        const intEvalMask = ipToInt(state.evalSubnetMask);
        
        // Must match the required mask, and both IPs must belong to the exact target network
        if (mask === state.evalSubnetMask && 
            (intA & intEvalMask) === intTargetNet && 
            (intB & intEvalMask) === intTargetNet && 
            ipA !== ipB) {
          isValid = true;
        }
      } else {
        // Standard learning validation (any valid matching subnets)
        if ((intA & intMask) === (intB & intMask) && ipA !== ipB) {
          isValid = true;
        }
      }

      if (isValid) {
        set({
          missionState: 'IPS_ASSIGNED',
          isModalOpen: state.currentScenario !== 'EVALUATION',
          currentTheory: state.currentScenario !== 'EVALUATION' ? 'NETWORK_LAYER' : null,
        });
        return true;
      }
    } catch (e) {
      // Invalid IP format
    }
    
    set({ missionState: 'PING_FAILED' });
    return false;
  },

  sendPing: () => {
    if (get().missionState !== 'IPS_ASSIGNED') return;
    set({
      missionState: 'PING_SUCCESS',
      isModalOpen: get().currentScenario !== 'EVALUATION',
      currentTheory: get().currentScenario !== 'EVALUATION' ? 'ICMP_PING' : null,
    });
  },

  closeModal: () => set({ isModalOpen: false, currentTheory: null })
}));

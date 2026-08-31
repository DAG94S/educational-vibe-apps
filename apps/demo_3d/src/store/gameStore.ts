import { create } from 'zustand';

export type GameMode = 'DIRECT' | 'STEP_BY_STEP';
export type MissionStep = 'IDLE' | 'SENDING_REQ' | 'QUERY_DB' | 'DB_RESP' | 'SENDING_RESP' | 'RENDERING' | 'SUCCESS';
export type TheoryTopic = 'BACKEND_REQ' | 'DATABASE' | 'BACKEND_RESP' | 'FRONTEND_RENDER' | null;

interface GameState {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  
  missionStep: MissionStep;
  isPaused: boolean;
  currentTheory: TheoryTopic;
  nextStepQueue: MissionStep | null;
  
  triggerMission: () => void;
  reachDestination: (nextStep: MissionStep, theory: TheoryTopic) => void;
  continueMission: () => void;
  resetMission: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'DIRECT',
  setMode: (mode) => set({ mode }),
  
  missionStep: 'IDLE',
  isPaused: false,
  currentTheory: null,
  nextStepQueue: null,
  
  triggerMission: () => set({ missionStep: 'SENDING_REQ', isPaused: false, currentTheory: null }),
  
  reachDestination: (nextStep, theory) => {
    const { mode } = get();
    if (mode === 'DIRECT') {
      set({ missionStep: nextStep });
      if (nextStep === 'RENDERING') {
         setTimeout(() => set({ missionStep: 'SUCCESS' }), 800);
      }
    } else {
      set({ isPaused: true, currentTheory: theory, nextStepQueue: nextStep });
    }
  },
  
  continueMission: () => {
    const { nextStepQueue } = get();
    if (nextStepQueue) {
      set({ missionStep: nextStepQueue, isPaused: false, currentTheory: null, nextStepQueue: null });
      if (nextStepQueue === 'RENDERING') {
          setTimeout(() => set({ missionStep: 'SUCCESS' }), 800);
      }
    }
  },

  resetMission: () => set({ missionStep: 'IDLE', isPaused: false, currentTheory: null, nextStepQueue: null })
}));

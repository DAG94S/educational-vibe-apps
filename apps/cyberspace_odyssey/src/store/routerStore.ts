import { create } from 'zustand';

export type NodeId = string;

export interface RouterNode {
  id: NodeId;
  position: [number, number, number];
  label: string;
  isEndpoint?: boolean; // If true, it's a PC/Server, not a router
}

// A routing entry: "If destination is X, send to next hop Y"
export interface RoutingEntry {
  destinationId: NodeId;
  nextHopId: NodeId;
}

export interface Edge {
  source: NodeId;
  target: NodeId;
}

export type SimulationState = 'IDLE' | 'SELECTING_ROUTE' | 'SIMULATING' | 'SUCCESS' | 'FAILED_DROP' | 'FAILED_LOOP';

interface RouterState {
  nodes: RouterNode[];
  edges: Edge[];
  routingTables: Record<NodeId, RoutingEntry[]>;
  simulationState: SimulationState;
  simulationResult: SimulationState | null;
  selectedNode: NodeId | null;
  targetNode: NodeId | null;
  packetPath: NodeId[]; // the path the packet actually takes during simulation
  
  tutorialStep: number; // 0: select R1, 1: config R1, 2: select R2, 3: config R2, 4: transmit

  // Actions
  setSelectedNode: (id: NodeId | null) => void;
  setTargetNode: (id: NodeId | null) => void;
  addRoute: (sourceId: NodeId, destinationId: NodeId, nextHopId: NodeId) => void;
  removeRoute: (sourceId: NodeId, destinationId: NodeId) => void;
  startSimulation: (sourceId: NodeId, finalDestId: NodeId) => void;
  finishSimulation: () => void;
  resetSimulation: () => void;
  loadScenario: (scenarioNumber: number) => void;
}

// Scenarios
const SCENARIO_1_NODES: RouterNode[] = [
  { id: 'PC_A', position: [-4, 0, 0], label: 'Client A', isEndpoint: true },
  { id: 'R1', position: [-1.5, 0, 0], label: 'Router 1' },
  { id: 'R2', position: [1.5, 0, 0], label: 'Router 2' },
  { id: 'PC_B', position: [4, 0, 0], label: 'Server B', isEndpoint: true },
];
const SCENARIO_1_EDGES: Edge[] = [
  { source: 'PC_A', target: 'R1' },
  { source: 'R1', target: 'R2' },
  { source: 'R2', target: 'PC_B' }
];
// Initial correct tables for endpoints, user needs to configure R1 and R2
const SCENARIO_1_INITIAL_TABLES: Record<NodeId, RoutingEntry[]> = {
  'PC_A': [{ destinationId: 'PC_B', nextHopId: 'R1' }],
  'R1': [],
  'R2': [],
  'PC_B': [{ destinationId: 'PC_A', nextHopId: 'R2' }],
};

export const useRouterStore = create<RouterState>((set, get) => ({
  nodes: SCENARIO_1_NODES,
  edges: SCENARIO_1_EDGES,
  routingTables: SCENARIO_1_INITIAL_TABLES,
  simulationState: 'IDLE',
  simulationResult: null,
  selectedNode: null,
  targetNode: null,
  packetPath: [],
  tutorialStep: 0,

  setSelectedNode: (id) => set((state) => {
    // Advance tutorial on selection
    let nextStep = state.tutorialStep;
    if (id === 'R1' && state.tutorialStep === 0) nextStep = 1;
    if (id === 'R2' && state.tutorialStep === 2) nextStep = 3;
    return { selectedNode: id, tutorialStep: nextStep };
  }),
  setTargetNode: (id) => set({ targetNode: id }),

  addRoute: (sourceId, destinationId, nextHopId) => set((state) => {
    // Ensure edge exists physically
    const edgeExists = state.edges.some(e => 
      (e.source === sourceId && e.target === nextHopId) ||
      (e.target === sourceId && e.source === nextHopId)
    );
    if (!edgeExists) return state;

    const table = state.routingTables[sourceId] || [];
    // Remove existing route for this destination if any
    const newTable = table.filter(r => r.destinationId !== destinationId);
    newTable.push({ destinationId, nextHopId });

    let nextStep = state.tutorialStep;
    if (sourceId === 'R1' && destinationId === 'PC_B' && nextHopId === 'R2' && state.tutorialStep === 1) nextStep = 2;
    if (sourceId === 'R2' && destinationId === 'PC_B' && nextHopId === 'PC_B' && state.tutorialStep === 3) nextStep = 4;

    return {
      routingTables: { ...state.routingTables, [sourceId]: newTable },
      tutorialStep: nextStep
    };
  }),

  removeRoute: (sourceId, destinationId) => set((state) => {
    const table = state.routingTables[sourceId] || [];
    return {
      routingTables: { ...state.routingTables, [sourceId]: table.filter(r => r.destinationId !== destinationId) }
    };
  }),

  startSimulation: (sourceId, finalDestId) => {
    const { routingTables } = get();
    let currentNode = sourceId;
    const path: NodeId[] = [currentNode];
    const maxHops = 10;
    let hops = 0;

    while (currentNode !== finalDestId && hops < maxHops) {
      const table = routingTables[currentNode] || [];
      const route = table.find(r => r.destinationId === finalDestId);

      if (!route) {
        set({ simulationState: 'SIMULATING', simulationResult: 'FAILED_DROP', packetPath: path });
        return;
      }

      currentNode = route.nextHopId;
      path.push(currentNode);
      hops++;
    }

    if (currentNode === finalDestId) {
      set({ simulationState: 'SIMULATING', simulationResult: 'SUCCESS', packetPath: path });
    } else {
      set({ simulationState: 'SIMULATING', simulationResult: 'FAILED_LOOP', packetPath: path });
    }
  },

  finishSimulation: () => set((state) => ({
    simulationState: state.simulationResult || 'IDLE'
  })),

  resetSimulation: () => set({ simulationState: 'IDLE', simulationResult: null, packetPath: [] }),

  loadScenario: (num) => {
    if (num === 1) {
      set({
        nodes: SCENARIO_1_NODES,
        edges: SCENARIO_1_EDGES,
        routingTables: SCENARIO_1_INITIAL_TABLES,
        simulationState: 'IDLE',
        selectedNode: null,
        targetNode: null,
        packetPath: []
      });
    }
  }
}));

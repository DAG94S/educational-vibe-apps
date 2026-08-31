import { useState, useCallback } from 'react';

export type NodeStatus = 'unvisited' | 'evaluating' | 'visited' | 'path';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  status: NodeStatus;
  distance: number;
  previous: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  isPath: boolean;
  isEvaluating: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Grafo inicial estilo Sci-Fi de ejemplo
const initialGraph: GraphData = {
  nodes: [
    { id: 'A', label: 'A', x: -4, y: 0, z: 0, status: 'unvisited', distance: Infinity, previous: null },
    { id: 'B', label: 'B', x: -1, y: 2, z: -2, status: 'unvisited', distance: Infinity, previous: null },
    { id: 'C', label: 'C', x: -1, y: -2, z: 2, status: 'unvisited', distance: Infinity, previous: null },
    { id: 'D', label: 'D', x: 2, y: 1, z: -1, status: 'unvisited', distance: Infinity, previous: null },
    { id: 'E', label: 'E', x: 2, y: -1, z: 1, status: 'unvisited', distance: Infinity, previous: null },
    { id: 'F', label: 'F', x: 5, y: 0, z: 0, status: 'unvisited', distance: Infinity, previous: null },
  ],
  edges: [
    { id: 'A-B', source: 'A', target: 'B', weight: 4, isPath: false, isEvaluating: false },
    { id: 'A-C', source: 'A', target: 'C', weight: 2, isPath: false, isEvaluating: false },
    { id: 'B-D', source: 'B', target: 'D', weight: 5, isPath: false, isEvaluating: false },
    { id: 'B-C', source: 'B', target: 'C', weight: 1, isPath: false, isEvaluating: false },
    { id: 'C-D', source: 'C', target: 'D', weight: 8, isPath: false, isEvaluating: false },
    { id: 'C-E', source: 'C', target: 'E', weight: 10, isPath: false, isEvaluating: false },
    { id: 'D-F', source: 'D', target: 'F', weight: 2, isPath: false, isEvaluating: false },
    { id: 'E-F', source: 'E', target: 'F', weight: 3, isPath: false, isEvaluating: false },
  ],
};

export const useDijkstra = () => {
  const [graph, setGraph] = useState<GraphData>(initialGraph);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetGraph = useCallback(() => {
    setGraph(initialGraph);
    setLogs([]);
    setActiveLine(0);
    setIsAnimating(false);
    setCurrentNodeId(null);
  }, []);

  const runDijkstra = async (startId: string, endId: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLogs([]);
    
    let currentNodes: GraphNode[] = initialGraph.nodes.map(n => ({
      ...n,
      distance: n.id === startId ? 0 : Infinity,
      previous: null,
      status: 'unvisited' as NodeStatus
    }));
    let currentEdges = initialGraph.edges.map(e => ({ ...e, isPath: false, isEvaluating: false }));
    
    setGraph({ nodes: currentNodes, edges: currentEdges });
    addLog(`[INICIO] Ejecutando Dijkstra de ${startId} a ${endId}`);
    setActiveLine(1); 

    const unvisited = new Set(currentNodes.map(n => n.id));

    while (unvisited.size > 0) {
      setActiveLine(3); 
      await sleep(800);
      
      let minNodeId: string | null = null;
      let minDistance = Infinity;
      
      for (const id of unvisited) {
        const node = currentNodes.find(n => n.id === id)!;
        if (node.distance < minDistance) {
          minDistance = node.distance;
          minNodeId = id;
        }
      }

      if (!minNodeId || minDistance === Infinity) {
        addLog(`Ruta inalcanzable.`);
        break;
      }

      setActiveLine(4);
      const currentNode = currentNodes.find(n => n.id === minNodeId)!;
      addLog(`Evaluando nodo ${minNodeId} (dist=${currentNode.distance})`);
      
      setCurrentNodeId(minNodeId);
      currentNodes = currentNodes.map(n => 
        n.id === minNodeId ? { ...n, status: 'evaluating' } : n
      );
      setGraph({ nodes: currentNodes, edges: currentEdges });
      await sleep(1000);

      if (minNodeId === endId) {
        addLog(`Destino ${endId} alcanzado (distancia total: ${currentNode.distance})`);
        break;
      }

      unvisited.delete(minNodeId);

      setActiveLine(5);
      const neighbors = currentEdges.filter(e => e.source === minNodeId || e.target === minNodeId);
      
      for (const edge of neighbors) {
        const neighborId = edge.source === minNodeId ? edge.target : edge.source;
        if (!unvisited.has(neighborId)) continue; 

        currentEdges = currentEdges.map(e => e.id === edge.id ? { ...e, isEvaluating: true } : e);
        setGraph({ nodes: currentNodes, edges: currentEdges });
        
        setActiveLine(6); 
        const altDistance = currentNode.distance + edge.weight;
        addLog(`  -> Revisando arista hacia ${neighborId} (peso: ${edge.weight}). Total: ${altDistance}`);
        await sleep(800);

        const neighborNode = currentNodes.find(n => n.id === neighborId)!;
        setActiveLine(7);
        if (altDistance < neighborNode.distance) {
          addLog(`  -> ¡Mejor ruta encontrada hacia ${neighborId}! Actualizando dist=${altDistance}`);
          setActiveLine(8); 
          currentNodes = currentNodes.map(n => 
            n.id === neighborId ? { ...n, distance: altDistance, previous: minNodeId } : n
          );
          setGraph({ nodes: currentNodes, edges: currentEdges });
          await sleep(800);
        }

        currentEdges = currentEdges.map(e => e.id === edge.id ? { ...e, isEvaluating: false } : e);
      }

      currentNodes = currentNodes.map(n => 
        n.id === minNodeId ? { ...n, status: 'visited' } : n
      );
      setGraph({ nodes: currentNodes, edges: currentEdges });
      await sleep(500);
    }

    setActiveLine(9); 
    const path: string[] = [];
    let curr = endId;
    let finalDist = currentNodes.find(n => n.id === endId)?.distance;

    if (finalDist === Infinity) {
        addLog(`[FIN] No se encontró ruta hacia ${endId}`);
    } else {
        while (curr) {
            path.unshift(curr);
            curr = currentNodes.find(n => n.id === curr)?.previous || '';
            if (!curr) break;
        }
        addLog(`[RESULTADO FINAL] Ruta óptima: ${path.join(' -> ')} con costo total de ${finalDist}`);
        
        currentNodes = currentNodes.map(n => 
            path.includes(n.id) ? { ...n, status: 'path' } : n
        );
        currentEdges = currentEdges.map(e => {
            const isPathEdge = path.includes(e.source) && path.includes(e.target) && 
                Math.abs(path.indexOf(e.source) - path.indexOf(e.target)) === 1;
            return { ...e, isPath: isPathEdge };
        });
        setGraph({ nodes: currentNodes, edges: currentEdges });
    }

    setActiveLine(0);
    setIsAnimating(false);
    setCurrentNodeId(null);
  };

  return {
    graph,
    logs,
    activeLine,
    isAnimating,
    currentNodeId,
    runDijkstra,
    resetGraph
  };
};

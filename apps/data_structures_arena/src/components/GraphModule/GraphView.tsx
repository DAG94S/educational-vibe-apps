import { useState } from 'react';
import { useDijkstra } from './useDijkstra';
import { GraphScene } from './GraphScene';
import { GraphSidebar } from './GraphSidebar';
import { Play, RotateCcw } from 'lucide-react';

export const GraphView = () => {
  const [mode, setMode] = useState<'enseñanza' | 'misiones'>('enseñanza');
  const {
    graph,
    logs,
    activeLine,
    isAnimating,
    currentNodeId,
    runDijkstra,
    resetGraph
  } = useDijkstra();

  const codeLines = [
    "function dijkstra(start, end):", // 1
    "  for each node: dist = Infinity, prev = null", // 2
    "  find unvisited node with minimum dist", // 3
    "  mark minNode as evaluating", // 4
    "  for each neighbor of minNode:", // 5
    "    altDist = minNode.dist + edge.weight", // 6
    "    if altDist < neighbor.dist:", // 7
    "      neighbor.dist = altDist; neighbor.prev = minNode", // 8
    "  reconstruct path from end to start" // 9
  ];

  return (
    <div className="w-full h-full flex flex-row">
      <GraphSidebar mode={mode} />
      
      <div className="flex-1 flex flex-col relative">
        {/* Controls panel */}
        <div className="bg-arena-surface/50 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md z-20 relative">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setMode('enseñanza')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'enseñanza' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Enseñanza
            </button>
            <button
              onClick={() => setMode('misiones')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'misiones' 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Misiones
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => runDijkstra('A', 'F')}
              disabled={isAnimating}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isAnimating 
                  ? 'bg-indigo-600/50 text-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]'
              }`}
            >
              <Play size={16} className="mr-2" />
              {isAnimating ? 'Ejecutando...' : 'Encontrar Ruta (A → F)'}
            </button>
            
            <button 
              onClick={resetGraph}
              className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700"
            >
              <RotateCcw size={16} className="mr-2" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 relative z-10 overflow-hidden">
          <GraphScene graph={graph} currentNodeId={currentNodeId} />
          
          {/* Overlay instruction */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-slate-400 border border-slate-800 flex items-center pointer-events-none">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-2"></span>
            Arrastra para rotar la cámara 3D • Scroll para zoom
          </div>
        </div>

        {/* Bottom Panel: Pseudocode & Logs */}
        <div className="h-48 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-row shrink-0 relative z-20">
          {/* Pseudocode */}
          <div className="flex-1 p-4 border-r border-slate-800 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Dijkstra Pseudocódigo
            </h3>
            <div className="bg-[#0d1117] rounded-lg p-3 border border-slate-800 font-mono text-[11px] overflow-y-auto flex-1">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = activeLine === lineNum;
                return (
                  <div 
                    key={idx} 
                    className={`px-2 py-0.5 rounded transition-colors duration-200 ${
                      isActive ? 'bg-indigo-900/50 text-indigo-300 border-l-2 border-indigo-400' : 'text-slate-500 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="opacity-50 mr-3">{lineNum}</span>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Análisis en Tiempo Real
            </h3>
            <div className="bg-[#0d1117] rounded-lg p-3 border border-slate-800 font-mono text-[11px] flex-1 overflow-y-auto space-y-1.5">
              {logs.length === 0 ? (
                <span className="text-slate-600 italic">Esperando iniciar simulación...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-emerald-400 opacity-90 animate-pulse">
                    &gt; {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

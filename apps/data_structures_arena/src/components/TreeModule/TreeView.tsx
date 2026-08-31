import { useState, useRef, useEffect } from 'react';
import { useBST } from './useBST';
import type { TreeNodeData } from './useBST';
import { TreeNode } from './TreeNode';
import { Sidebar } from './Sidebar';
import { TreeEdge } from './TreeEdge';
import { Play, RotateCcw, BookOpen, Target } from 'lucide-react';

export const TreeView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const { root, insert, reset, loadExampleTree, isAnimating, activeLine, logs, activeNodeId } = useBST(width);
  const [mode, setMode] = useState<'enseñanza' | 'misiones'>('misiones');

  const handleModeChange = (newMode: 'enseñanza' | 'misiones') => {
    setMode(newMode);
    if (newMode === 'enseñanza') {
      loadExampleTree();
    } else {
      reset();
    }
  };
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (!isNaN(val)) {
      insert(val);
      setInputValue('');
    }
  };

  const codeLines = [
    "function insert(value):", // 1
    "  if root is null: root = new Node(value)", // 2
    "  if current is null: return new Node(value)", // 3
    "  compare value with current.value", // 4
    "  if value < current.value: go LEFT", // 5
    "  if value > current.value: go RIGHT", // 6
    "  if value == current.value: ignore", // 7
    "  rebalance tree visual positions" // 8
  ];

  const renderTree = (node: TreeNodeData | null): React.ReactNode => {
    if (!node) return null;

    return (
      <>
        {node.left && <TreeEdge parent={node} child={node.left} />}
        {node.right && <TreeEdge parent={node} child={node.right} />}
        
        <TreeNode key={node.id} node={node} isActive={node.id === activeNodeId} />
        
        {renderTree(node.left)}
        {renderTree(node.right)}
      </>
    );
  };

  return (
    <div className="w-full h-full flex flex-row">
      <Sidebar mode={mode} />
      <div className="flex-1 flex flex-col relative">
      {/* Controls panel */}
      <div className="bg-arena-surface/50 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md z-20 relative">
        {/* Mode Selector */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => handleModeChange('enseñanza')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'enseñanza' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen size={16} className="mr-2" />
            Enseñanza
          </button>
          <button 
            onClick={() => handleModeChange('misiones')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'misiones' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Target size={16} className="mr-2" />
            Misiones
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
        <form onSubmit={handleInsert} className="flex items-center gap-2">
          <input 
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Valor (ej. 42)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-arena-primary transition-colors w-32 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-400"
            disabled={isAnimating}
          />
          <button 
            type="submit"
            disabled={!inputValue || isAnimating}
            className="bg-arena-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
          >
            <Play size={16} className="mr-2" />
            Insertar
          </button>
        </form>

        <button 
          onClick={reset}
          disabled={isAnimating || !root}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
        >
          <RotateCcw size={16} className="mr-2" />
          Reiniciar
        </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-arena-bg"
      >
        {renderTree(root)}
        
        {!root && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic pointer-events-none">
            El árbol está vacío. Inserta un nodo para comenzar.
          </div>
        )}
      </div>

      {/* Bottom Panel: Pseudocode & Logs */}
      <div className="h-48 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-row shrink-0 relative z-20">
        {/* Pseudocode */}
        <div className="flex-1 p-4 border-r border-slate-800 flex flex-col">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Pseudocódigo de Inserción
          </h3>
          <div className="bg-[#0d1117] rounded-lg p-3 border border-slate-800 font-mono text-[11px] overflow-y-auto flex-1">
            {codeLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = activeLine === lineNum;
              return (
                <div 
                  key={idx} 
                  className={`px-2 py-0.5 rounded transition-colors duration-200 ${
                    isActive ? 'bg-blue-900/50 text-blue-300 border-l-2 border-blue-400' : 'text-slate-500 border-l-2 border-transparent'
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
              <span className="text-slate-600 italic">Esperando acción...</span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-green-400 opacity-90 animate-pulse">
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

import { Network, BookOpen, Target, CheckCircle2 } from 'lucide-react';

interface GraphSidebarProps {
  mode?: 'enseñanza' | 'misiones';
}

export const GraphSidebar = ({ mode = 'misiones' }: GraphSidebarProps) => {
  return (
    <div className="w-[400px] bg-[#0d1117] border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-slate-800 bg-[#0d1117]">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <Network className="mr-2 text-indigo-400" />
          {mode === 'enseñanza' ? 'Teoría: Grafo Ponderado' : 'Misiones: Dijkstra'}
        </h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-8 bg-[#0d1117]">
        {mode === 'enseñanza' ? (
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 rounded-xl p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>
            <h3 className="text-base font-bold text-indigo-400 mb-4 flex items-center relative z-10">
              <BookOpen size={18} className="mr-2" />
              Algoritmo de Dijkstra
            </h3>
            <div className="text-sm text-slate-300 space-y-4 leading-relaxed relative z-10">
              <p>Dijkstra encuentra el camino de menor costo desde un nodo de origen hacia todos los demás nodos en un grafo estructurado.</p>
              
              <div className="bg-black/40 p-4 rounded-lg border border-slate-800/80 space-y-2 backdrop-blur-sm">
                <p className="font-semibold text-slate-400 mb-2 font-mono text-xs uppercase tracking-widest">Matriz de Datos:</p>
                <div className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  <span><strong>Nodos:</strong> Puntos de conexión (esferas de energía).</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>Aristas:</strong> Enlaces de datos (láseres ópticos).</span>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Peso:</strong> Latencia o costo computacional del salto.</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-lg border border-slate-800/80 space-y-2 backdrop-blur-sm">
                <h3 className="font-semibold text-slate-400 mb-2 font-mono text-xs uppercase tracking-widest">Protocolo de Ejecución:</h3>
                <ul className="space-y-3 mt-2">
                  <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" /> <span className="text-slate-300"><strong>Inicialización:</strong> Nodo origen = 0, resto = ∞.</span></li>
                  <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-yellow-400 mr-2 shrink-0 mt-0.5" /> <span className="text-slate-300"><strong>Escaneo:</strong> Visita el nodo no procesado de menor costo.</span></li>
                  <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-blue-400 mr-2 shrink-0 mt-0.5" /> <span className="text-slate-300"><strong>Relajación:</strong> Actualiza las rutas óptimas a los nodos vecinos.</span></li>
                </ul>
              </div>
              
              <div className="bg-amber-900/10 p-4 rounded-lg mt-4 border border-amber-500/20">
                <p className="text-amber-400 font-semibold mb-2 flex items-center">
                  <Target size={16} className="mr-2" /> Iniciar Secuencia:
                </p>
                <p className="text-slate-400 text-xs">Ejecuta el algoritmo en el panel de control. El motor 3D trazará la propagación de datos en tiempo real.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/50 backdrop-blur-md">
            <h3 className="text-xs font-semibold text-indigo-400 mb-4 uppercase tracking-widest font-mono">
              Secuencias de Misión
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start text-slate-300 hover:text-white transition-colors">
                <div className="w-4 h-4 rounded-full border border-indigo-500/50 mr-3 mt-0.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span><strong>Sector 1:</strong> Interfaz con el clúster 3D. Rota la vista e identifica el Nodo A y F.</span>
              </li>
              <li className="flex items-start text-slate-300 hover:text-white transition-colors">
                <div className="w-4 h-4 rounded-full border border-indigo-500/50 mr-3 mt-0.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span><strong>Sector 2:</strong> Inyecta el algoritmo Dijkstra para encontrar la ruta óptima de menor latencia.</span>
              </li>
              <li className="flex items-start text-slate-300 hover:text-white transition-colors">
                <div className="w-4 h-4 rounded-full border border-indigo-500/50 mr-3 mt-0.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span><strong>Sector 3:</strong> Lee el costo final en el HUD del Nodo F.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

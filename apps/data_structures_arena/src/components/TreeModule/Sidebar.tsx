import { Terminal, BookOpen, Target } from 'lucide-react';

interface SidebarProps {
  mode?: 'enseñanza' | 'misiones';
}

export const Sidebar = ({ mode = 'misiones' }: SidebarProps) => {
  return (
    <div className="w-[400px] bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-lg font-bold text-arena-primary flex items-center">
          <Terminal size={18} className="mr-2" />
          Teoría y Gamificación
        </h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-8">
        {mode === 'enseñanza' ? (
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl p-5 border border-blue-500/30 shadow-lg">
            <h3 className="text-base font-bold text-blue-400 mb-4 flex items-center">
              <BookOpen size={18} className="mr-2" />
              ¿Qué es un BST?
            </h3>
            <div className="text-sm text-slate-300 space-y-4 leading-relaxed">
              <p>Un Árbol Binario de Búsqueda es una estructura jerárquica ideal para búsquedas rápidas. Cada <strong>nodo</strong> tiene como máximo dos hijos.</p>
              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700 space-y-2">
                <p className="font-semibold text-slate-200 mb-2">La regla de oro:</p>
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Si es <strong>menor</strong>, va a la rama <strong className="text-blue-400">Izquierda</strong>.</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Si es <strong>mayor</strong>, va a la rama <strong className="text-blue-400">Derecha</strong>.</span>
                </div>
              </div>
              <div className="bg-amber-900/20 p-4 rounded-lg mt-4 border border-amber-500/30">
                <p className="text-amber-400 font-semibold mb-2 flex items-center">
                  <Target size={16} className="mr-2" /> Tu turno:
                </p>
                <p className="text-slate-300">El árbol ya está estructurado. Escribe un número en la barra superior (ej. <strong className="text-white">45</strong> o <strong className="text-white">95</strong>) y dale a Insertar para ver al algoritmo en acción.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Tus Misiones
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-500 mr-3 mt-0.5 shrink-0"></div>
                <span><strong>Misión 1:</strong> Crea la raíz insertando cualquier número.</span>
              </li>
              <li className="flex items-start text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-500 mr-3 mt-0.5 shrink-0"></div>
                <span><strong>Misión 2:</strong> Inserta un valor menor para crear un hijo izquierdo.</span>
              </li>
              <li className="flex items-start text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-500 mr-3 mt-0.5 shrink-0"></div>
                <span><strong>Misión 3:</strong> Intenta insertar un valor que ya exista.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

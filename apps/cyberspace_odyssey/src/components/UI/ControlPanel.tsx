import { useRouterStore } from '../../store/routerStore';
import { ShieldAlert, Play, RefreshCw, CheckCircle, Info } from 'lucide-react';

export const ControlPanel = () => {
  const { 
    selectedNode, nodes, routingTables, simulationState, tutorialStep,
    startSimulation, resetSimulation, addRoute, removeRoute 
  } = useRouterStore();

  const node = nodes.find(n => n.id === selectedNode);

  const getTutorialText = () => {
    switch(tutorialStep) {
      case 0: return "Paso 1: Selecciona el Router 1 (en el medio a la izquierda).";
      case 1: return "Paso 2: En el panel inferior, añade una ruta para alcanzar al Server B vía el Router 2.";
      case 2: return "Paso 3: ¡Bien! Ahora selecciona el Router 2 (en el medio a la derecha).";
      case 3: return "Paso 4: Añade una ruta para alcanzar al Server B vía el mismo Server B (conexión directa).";
      case 4: return "Paso 5: ¡Excelente! Haz clic en 'Transmit Packet' arriba a la derecha para probar la red.";
      default: return "Misión Cumplida.";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Header - Mission HUD */}
      <header className="flex justify-between items-start">
        <div className="bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 p-4 rounded-lg pointer-events-auto max-w-md">
          <h1 className="text-xl font-black text-slate-800 tracking-wide flex items-center gap-2">
            <Info className="text-blue-600" size={24} />
            MISIÓN 1: Enrutamiento Básico
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Configura las tablas de enrutamiento para que el paquete pueda viajar desde el <strong>Client A</strong> hasta el <strong>Server B</strong> sin perderse.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2">
            <div className="mt-0.5 text-blue-600">
              {tutorialStep >= 4 ? <CheckCircle size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-blue-600 animate-pulse" />}
            </div>
            <p className="text-blue-800 text-sm font-semibold">{getTutorialText()}</p>
          </div>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => resetSimulation()}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={18} /> Resetear
          </button>
          <button 
            onClick={() => startSimulation('PC_A', 'PC_B')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-bold shadow-md ${
              tutorialStep >= 4 ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            disabled={tutorialStep < 4}
          >
            <Play size={18} /> Transmit Packet
          </button>
        </div>
      </header>

      {/* Bottom Area - Node Editor */}
      <div className="flex justify-center pointer-events-auto">
        {selectedNode && node ? (
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-6 rounded-lg w-[32rem] shadow-2xl transition-all duration-300 transform translate-y-0">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-between">
              {node.label}
              <span className={`text-xs px-2 py-1 rounded font-bold ${node.isEndpoint ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {node.isEndpoint ? 'ENDPOINT' : 'ROUTER'}
              </span>
            </h2>
            
            {node.isEndpoint ? (
              <p className="text-slate-500 text-sm p-4 bg-slate-50 rounded border border-slate-100">
                Los Endpoints (PCs y Servidores) no pueden ser configurados en este nivel de simulación.
              </p>
            ) : (
              <div className="mt-4">
                <h3 className="text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Tabla de Enrutamiento</h3>
                
                {/* Current Routes */}
                {routingTables[node.id]?.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center text-slate-500 text-sm">
                    No hay rutas configuradas. El paquete será descartado (Drop).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {routingTables[node.id]?.map((route, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 shadow-sm p-3 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            Destino: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">{nodes.find(n => n.id === route.destinationId)?.label}</span>
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-sm text-slate-600">
                            Siguiente Salto: <span className="text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded">{nodes.find(n => n.id === route.nextHopId)?.label}</span>
                          </span>
                        </div>
                        <button 
                          onClick={() => removeRoute(node.id, route.destinationId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          Borrar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Route Form (Simplified for Gamification) */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                   <p className="text-sm text-slate-700 font-semibold mb-3">Añadir Nueva Ruta:</p>
                   <div className="flex flex-col gap-2">
                      {node.id === 'R1' && (
                        <button 
                          onClick={() => addRoute(node.id, 'PC_B', 'R2')}
                          className={`py-2 text-sm rounded font-bold transition-all ${
                            tutorialStep === 1 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Para llegar al [Server B] ➔ Enviar a [Router 2]
                        </button>
                      )}
                      {node.id === 'R2' && (
                        <button 
                          onClick={() => addRoute(node.id, 'PC_B', 'PC_B')}
                          className={`py-2 text-sm rounded font-bold transition-all ${
                            tutorialStep === 3
                              ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Para llegar al [Server B] ➔ Enviar a [Server B]
                        </button>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/90 shadow-lg border border-slate-200 p-4 rounded-lg backdrop-blur-sm text-slate-600 flex items-center gap-3 animate-bounce">
            <ShieldAlert size={20} className="text-blue-500" />
            <span className="font-medium">Selecciona un Router en la escena 3D para configurarlo.</span>
          </div>
        )}
      </div>
      
      {/* Status Overlay */}
      {simulationState !== 'IDLE' && simulationState !== 'SELECTING_ROUTE' && simulationState !== 'SIMULATING' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900/40 backdrop-blur-sm">
           <div className={`p-8 rounded-xl border-4 text-center shadow-2xl bg-white max-w-lg ${ 
             simulationState === 'SUCCESS' ? 'border-green-500' : 'border-red-500'
           }`}>
             <h2 className={`text-4xl font-black mb-4 ${simulationState === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
               {simulationState === 'SUCCESS' ? '¡TRANSMISIÓN EXITOSA!' : 
                simulationState === 'FAILED_DROP' ? 'PAQUETE DESCARTADO' : 'BUCLE DE ENRUTAMIENTO'}
             </h2>
             <p className="text-slate-700 text-lg">
               {simulationState === 'SUCCESS' ? 'El paquete encontró su camino y llegó al Server B correctamente.' : 
                simulationState === 'FAILED_DROP' ? 'Un router no tenía una ruta hacia el destino y descartó el paquete (Drop).' : 'El paquete se quedó rebotando entre los routers hasta que su TTL (Tiempo de Vida) expiró.'}
             </p>
             <button 
                onClick={() => resetSimulation()}
                className="mt-8 pointer-events-auto bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-900 shadow-lg transition-transform hover:scale-105"
             >
               Intentarlo de Nuevo
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

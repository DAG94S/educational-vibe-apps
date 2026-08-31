import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Database, MonitorPlay, Zap, ArrowRight, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';

const THEORY_CONTENT = {
  BACKEND_REQ: {
    title: "El Cerebro: Backend (Petición)",
    content: "La petición HTTP ha llegado al Servidor. Aquí reside la lógica de negocio. El Backend valida quién eres (Autenticación) y decide si tienes permiso para ver estos datos (Autorización). Si todo está en orden, preparará una consulta para la base de datos.",
    icon: <Server className="text-neon-purple w-8 h-8" />,
    color: "neon-purple"
  },
  DATABASE: {
    title: "La Bóveda: Base de Datos",
    content: "El motor de Base de Datos recibe la consulta (ej. SQL). Su trabajo es buscar entre miles o millones de registros de forma eficiente, persistir nueva información y devolver los datos exactos que el servidor solicitó.",
    icon: <Database className="text-neon-pink w-8 h-8" />,
    color: "neon-pink"
  },
  BACKEND_RESP: {
    title: "Ensamblaje: Backend (Respuesta)",
    content: "La Base de Datos entregó los datos crudos. El Servidor ahora los procesa, los formatea (generalmente en una estructura ligera llamada JSON) y los empaqueta en una Respuesta HTTP para viajar de vuelta por la red hacia el dispositivo del cliente.",
    icon: <Server className="text-neon-purple w-8 h-8" />,
    color: "neon-purple"
  },
  FRONTEND_RENDER: {
    title: "El Lienzo: Frontend (Renderizado)",
    content: "¡Los datos llegaron! El navegador web (o la app móvil) interpreta el JSON recibido. Utilizando herramientas como React, el Frontend actualiza el Document Object Model (DOM) de forma dinámica, pintando la interfaz visual que el usuario final consumirá.",
    icon: <MonitorPlay className="text-neon-blue w-8 h-8" />,
    color: "neon-blue"
  }
};

export const ControlPanel = () => {
  const { missionStep, triggerMission, resetMission, mode, setMode, isPaused, currentTheory, continueMission } = useGameStore();

  const isClientActive = ['SENDING_REQ', 'RENDERING', 'SUCCESS'].includes(missionStep);
  const isServerActive = ['SENDING_REQ', 'QUERY_DB', 'DB_RESP', 'SENDING_RESP'].includes(missionStep);
  const isDbActive = ['QUERY_DB', 'DB_RESP'].includes(missionStep);

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 flex flex-col justify-between z-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-neon">
              Data Reactor
            </h1>
            <p className="text-gray-400 mt-1">Demostración: Flujo Completo Cliente-Servidor</p>
          </div>
          
          <button 
            onClick={() => setMode(mode === 'DIRECT' ? 'STEP_BY_STEP' : 'DIRECT')}
            className="pointer-events-auto bg-gray-900/80 border border-gray-700 px-4 py-2 rounded-full flex items-center gap-3 text-gray-300 hover:text-white transition-colors backdrop-blur-sm"
          >
            <span className="text-sm font-medium">{mode === 'DIRECT' ? 'Modo Directo' : 'Modo Paso a Paso'}</span>
            {mode === 'DIRECT' ? <ToggleLeft className="text-gray-500" /> : <ToggleRight className="text-neon-blue drop-shadow-neon" />}
          </button>
        </header>

        <div className="flex justify-between items-end">
          <motion.div 
            className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-6 rounded-xl w-80 pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-white">Navegador Web</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 font-mono">
                <span className="text-neon-blue font-bold">GET</span> https://misitio.edu.ec
              </div>

              <button 
                onClick={triggerMission}
                disabled={missionStep !== 'IDLE' && missionStep !== 'SUCCESS'}
                className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.5)]"
              >
                <Zap size={18} /> 
                {missionStep === 'IDLE' || missionStep === 'SUCCESS' ? 'Cargar Página' : 'Procesando...'}
              </button>
              
              {missionStep === 'SUCCESS' && (
                <button onClick={resetMission} className="w-full text-xs text-gray-400 mt-2 hover:text-white transition-colors">
                  Limpiar Caché y Reiniciar
                </button>
              )}
            </div>
          </motion.div>

          <div className="flex gap-6 pointer-events-auto bg-gray-900/60 p-4 rounded-xl backdrop-blur-sm border border-gray-800">
              <StatusIcon active={isClientActive} icon={<MonitorPlay />} label="Cliente" color="neon-blue" />
              <StatusIcon active={isServerActive} icon={<Server />} label="Servidor" color="neon-purple" />
              <StatusIcon active={isDbActive} icon={<Database />} label="Base de Datos" color="neon-pink" />
          </div>
        </div>
      </div>

      {/* Theory Modal overlay when paused */}
      <AnimatePresence>
        {isPaused && currentTheory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-${THEORY_CONTENT[currentTheory].color}`}></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-lg bg-gray-800 border border-gray-700 shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                  {THEORY_CONTENT[currentTheory].icon}
                </div>
                <div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><BookOpen size={14}/> Teoría Educativa</h3>
                  <h2 className="text-2xl font-bold text-white mt-1">{THEORY_CONTENT[currentTheory].title}</h2>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {THEORY_CONTENT[currentTheory].content}
              </p>
              
              <button 
                onClick={continueMission}
                className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-600 hover:border-gray-500"
              >
                Continuar Flujo <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const StatusIcon = ({ active, icon, label, color }: { active: boolean, icon: React.ReactNode, label: string, color: string }) => {
  const getColors = () => {
    if (!active) return 'text-gray-600 border-gray-700 bg-gray-800';
    if (color === 'neon-blue') return 'text-[#00f3ff] border-[#00f3ff] bg-gray-800 shadow-[0_0_10px_rgba(0,243,255,0.4)]';
    if (color === 'neon-purple') return 'text-[#b026ff] border-[#b026ff] bg-gray-800 shadow-[0_0_10px_rgba(176,38,255,0.4)]';
    if (color === 'neon-pink') return 'text-[#ff00ff] border-[#ff00ff] bg-gray-800 shadow-[0_0_10px_rgba(255,0,255,0.4)]';
    return '';
  };

  return (
    <div className={`flex flex-col items-center gap-2 transition-all duration-500`}>
      <div className={`p-4 rounded-full border transition-all duration-500 ${getColors()}`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wider ${active ? 'text-gray-200' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
};

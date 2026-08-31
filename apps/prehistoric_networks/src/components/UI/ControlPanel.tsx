import { useGameStore } from '../../store/gameStore';
import { HelpCircle, X, Terminal, ArrowRight, BookOpen, Layers, ShieldAlert } from 'lucide-react';

const TheoryModal = () => {
  const { isModalOpen, currentTheory, closeModal } = useGameStore();

  if (!isModalOpen || !currentTheory) return null;

  const getTheoryContent = () => {
    switch (currentTheory) {
      case 'PHYSICAL_LAYER':
        return {
          title: 'Capa 1: Capa Física (Modelo OSI)',
          content: 'Acabas de conectar físicamente el PC al Switch. En el mundo real esto se hace con cables Ethernet (UTP). La Capa Física se encarga de transmitir los bits a través del medio. Sin cable, ¡no hay red local!',
        };
      case 'NETWORK_LAYER':
        return {
          title: 'Capa 3: Capa de Red (Modelo OSI)',
          content: '¡Excelente validación! Al asignarle IPs a las PCs en la misma subred, creaste una red lógica. El protocolo IP permite que los dispositivos sepan dónde están y con quién pueden comunicarse directamente.',
        };
      case 'ICMP_PING':
        return {
          title: 'ICMP y el Comando Ping',
          content: '¡Datos enviados y recibidos! El comando Ping usa el protocolo ICMP para enviar un "Echo Request" y esperar un "Echo Reply". Es la herramienta fundamental para diagnosticar si un equipo está vivo en la red.',
        };
      default:
        return { title: '', content: '' };
    }
  };

  const theory = getTheoryContent();

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pointer-events-auto">
      <div className="bg-stone-900 border border-[#00ffcc] rounded-lg p-6 max-w-lg shadow-[0_0_30px_rgba(0,255,204,0.2)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00ffcc] flex items-center gap-2">
            <HelpCircle size={24} />
            {theory.title}
          </h2>
          <button onClick={closeModal} className="text-stone-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-stone-300 leading-relaxed">
          {theory.content}
        </p>
        <button 
          onClick={closeModal}
          className="mt-6 w-full py-2 bg-[#00ffcc]/20 hover:bg-[#00ffcc]/40 text-[#00ffcc] font-bold rounded border border-[#00ffcc]/50 transition-colors"
        >
          Entendido, continuar
        </button>
      </div>
    </div>
  );
};

export const ControlPanel = () => {
  const { missionState, currentScenario, setScenario, evalTargetNetwork, evalSubnetMask } = useGameStore();

  return (
    <div className="pointer-events-none absolute inset-0">
      <TheoryModal />

      {/* Top Navigation Tabs */}
      <div className="absolute top-0 left-0 w-full flex justify-center p-4 z-40 pointer-events-auto">
        <div className="bg-stone-900/90 backdrop-blur border border-stone-700 rounded-full flex overflow-hidden shadow-lg">
          <button 
            onClick={() => setScenario('LEARNING_1')}
            className={`px-6 py-2 flex items-center gap-2 text-sm font-bold transition-colors ${currentScenario === 'LEARNING_1' ? 'bg-[#00ffcc] text-black' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <BookOpen size={16} />
            Básico
          </button>
          <button 
            onClick={() => setScenario('LEARNING_2')}
            className={`px-6 py-2 flex items-center gap-2 text-sm font-bold transition-colors border-l border-stone-700 ${currentScenario === 'LEARNING_2' ? 'bg-[#00ffcc] text-black' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <Layers size={16} />
            Estrella LAN
          </button>
          <button 
            onClick={() => setScenario('EVALUATION')}
            className={`px-6 py-2 flex items-center gap-2 text-sm font-bold transition-colors border-l border-stone-700 ${currentScenario === 'EVALUATION' ? 'bg-[#ff3366] text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            <ShieldAlert size={16} />
            Evaluación
          </button>
        </div>
      </div>

      {/* Left Instructions Panel */}
      <div className="absolute top-20 left-8 bg-stone-900/80 p-4 rounded border border-stone-700 backdrop-blur z-40 max-w-xs pointer-events-auto">
        <h2 className="text-[#00ffcc] font-bold mb-3 flex items-center gap-2">
          <Terminal size={18} />
          {currentScenario === 'EVALUATION' ? 'Modo Examen' : 'Simulador de Red'}
        </h2>
        
        {currentScenario === 'EVALUATION' ? (
          <div className="text-sm text-stone-300 space-y-4">
            <p className="text-[#ff3366] font-bold bg-[#ff3366]/10 p-2 rounded border border-[#ff3366]/30">
              Red Asignada: {evalTargetNetwork} <br/>
              Máscara: {evalSubnetMask}
            </p>
            <p>1. Conecta el cable al Switch.</p>
            <p>2. Configura IPs válidas para esta red. (Si te equivocas, el router rechazará la conexión).</p>
            <p>3. Ejecuta un Ping exitoso.</p>
          </div>
        ) : currentScenario === 'LEARNING_2' ? (
          <div className="text-sm text-stone-300 space-y-3">
             <p>Todos los equipos conectados a este Switch forman una única Red de Área Local (LAN).</p>
             <li className={`flex items-start gap-2 ${missionState === 'IDLE' ? 'text-white font-bold' : 'opacity-50'}`}>
              <ArrowRight size={16} className="mt-0.5 shrink-0" />
              <p>Conecta el PC faltante para completar la estrella.</p>
            </li>
            <li className={`flex items-start gap-2 ${missionState === 'CABLE_CONNECTED' || missionState === 'PING_FAILED' ? 'text-white font-bold' : 'opacity-50'}`}>
              <ArrowRight size={16} className="mt-0.5 shrink-0" />
              <p>Asigna IPs en la misma subred a todos los equipos.</p>
            </li>
          </div>
        ) : (
          <ul className="text-sm text-stone-300 space-y-3">
            <li className={`flex items-start gap-2 ${missionState === 'IDLE' ? 'text-white font-bold' : 'opacity-50'}`}>
              <ArrowRight size={16} className="mt-0.5 shrink-0" />
              <p>1. Arrastra el cable desde el PC 1 hasta el Switch central para conectarlos físicamente.</p>
            </li>
            <li className={`flex items-start gap-2 ${missionState === 'CABLE_CONNECTED' || missionState === 'PING_FAILED' ? 'text-white font-bold' : 'opacity-50'}`}>
              <ArrowRight size={16} className="mt-0.5 shrink-0" />
              <p>2. Ingresa IPs válidas para ambos PCs en la misma subred y presiona Validar.</p>
            </li>
            <li className={`flex items-start gap-2 ${missionState === 'IPS_ASSIGNED' ? 'text-white font-bold' : 'opacity-50'}`}>
              <ArrowRight size={16} className="mt-0.5 shrink-0" />
              <p>3. Haz clic en el PC 1, y luego selecciona el PC 2 como objetivo para enviar un PING.</p>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

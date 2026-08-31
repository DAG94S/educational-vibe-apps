import { Database, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SqlSidebarProps {
  completedMissions: number[];
}

export const SqlSidebar = ({ completedMissions }: SqlSidebarProps) => {
  return (
    <div className="w-[450px] bg-[#05010f]/95 border-r border-[#ff2a85]/30 flex flex-col h-full shrink-0 shadow-[4px_0_30px_rgba(255,42,133,0.15)] relative z-20 backdrop-blur-xl">
      
      {/* Decorative Header */}
      <div className="p-8 border-b border-[#00f0ff]/20 bg-gradient-to-r from-[#ff2a85]/10 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2a85] rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff2a85] to-[#00f0ff] mb-2 flex items-center tracking-wider">
          <Database className="mr-3 text-[#ff2a85]" size={28} />
          CYBER-HEIST
        </h2>
        <p className="text-[#00f0ff]/60 text-xs font-mono uppercase tracking-[0.3em]">Operación: Detective SQL</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8 custom-scrollbar">
        
        {/* Archivo del Caso */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff2a85] to-[#00f0ff] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-[#0a0518] rounded-xl p-6 border border-[#ff2a85]/30">
            <h3 className="text-sm font-bold text-[#ff2a85] mb-4 uppercase tracking-[0.2em] flex items-center">
              <ShieldAlert size={16} className="mr-2" /> Archivo del Caso
            </h3>
            <p className="text-[15px] text-slate-300 leading-relaxed font-light">
              Infiltración detectada en el Mainframe. Tenemos volcados de datos: <strong className="text-[#00f0ff] font-bold">suspects</strong> y <strong className="text-[#a855f7] font-bold">gangs</strong>. Usa comandos SQL puros para rastrear a los culpables.
            </p>
          </div>
        </div>

        {/* Misiones */}
        <div className="relative">
          <h3 className="text-sm font-bold text-[#00f0ff] mb-6 uppercase tracking-[0.2em] flex items-center px-2">
            <Terminal size={16} className="mr-2" /> Nodos de Búsqueda
          </h3>
          <ul className="space-y-6">
            
            {/* Misión 1 */}
            <li className={`relative bg-slate-900/40 p-5 rounded-lg border-l-2 transition-colors duration-500 ${completedMissions.includes(1) ? 'border-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'border-slate-700 hover:bg-slate-900/60'}`}>
              <div className="flex items-start">
                {completedMissions.includes(1) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00f0ff] mr-4 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 mr-4 shrink-0 mt-0.5"></div>
                )}
                <div>
                  <strong className={`block mb-2 font-medium tracking-wide ${completedMissions.includes(1) ? 'text-[#00f0ff]' : 'text-white'}`}>Misión 1: Reconocimiento</strong>
                  <p className="text-slate-400 text-sm mb-3">Obtén la lista completa de todos los sospechosos.</p>
                  <code className="bg-[#05010f] px-3 py-2 rounded text-[#00f0ff] font-mono text-xs border border-[#00f0ff]/30 block shadow-inner opacity-75">
                    SELECT * FROM suspects
                  </code>
                </div>
              </div>
            </li>
            
            {/* Misión 2 */}
            <li className={`relative bg-slate-900/40 p-5 rounded-lg border-l-2 transition-colors duration-500 ${completedMissions.includes(2) ? 'border-[#ff2a85] bg-[#ff2a85]/5 shadow-[0_0_15px_rgba(255,42,133,0.15)]' : 'border-slate-700 hover:bg-slate-900/60'}`}>
              <div className="flex items-start">
                {completedMissions.includes(2) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#ff2a85] mr-4 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(255,42,133,0.8)]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 mr-4 shrink-0 mt-0.5"></div>
                )}
                <div>
                  <strong className={`block mb-2 font-medium tracking-wide ${completedMissions.includes(2) ? 'text-[#ff2a85]' : 'text-white'}`}>Misión 2: Filtrado</strong>
                  <p className="text-slate-400 text-sm mb-3">El atacante pertenece a la banda 'G1'. Filtra los sospechosos.</p>
                  <code className="bg-[#05010f] px-3 py-2 rounded text-[#ff2a85] font-mono text-xs border border-[#ff2a85]/30 block shadow-inner opacity-75">
                    SELECT * FROM suspects WHERE gang_id = 'G1'
                  </code>
                </div>
              </div>
            </li>

            {/* Misión 3 */}
            <li className={`relative bg-slate-900/40 p-5 rounded-lg border-l-2 transition-colors duration-500 ${completedMissions.includes(3) ? 'border-[#a855f7] bg-[#a855f7]/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-slate-700 hover:bg-slate-900/60'}`}>
              <div className="flex items-start">
                {completedMissions.includes(3) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#a855f7] mr-4 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 mr-4 shrink-0 mt-0.5"></div>
                )}
                <div>
                  <strong className={`block mb-2 font-medium tracking-wide ${completedMissions.includes(3) ? 'text-[#a855f7]' : 'text-white'}`}>Misión 3: Intersección (JOIN)</strong>
                  <p className="text-slate-400 text-sm mb-3">Cruza los datos de sospechosos y bandas para hallar guaridas.</p>
                  <code className="bg-[#05010f] px-3 py-2 rounded text-[#a855f7] font-mono text-xs border border-[#a855f7]/30 block shadow-inner opacity-75">
                    SELECT suspects.name, gangs.name as gang_name FROM suspects JOIN gangs ON suspects.gang_id = gangs.id
                  </code>
                </div>
              </div>
            </li>
            
          </ul>
        </div>

      </div>
    </div>
  );
};

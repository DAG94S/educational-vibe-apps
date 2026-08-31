import { Activity, ShieldAlert, Cpu, CheckSquare, BookOpen, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface AcidSidebarProps {
  onRunIsolationUnsafe: () => void;
  onRunIsolationSafe: () => void;
  onRunAtomicity: () => void;
  logsA: string[];
  logsB: string[];
  balance: number;
}

export const AcidSidebar = ({ onRunIsolationUnsafe, onRunIsolationSafe, onRunAtomicity, logsA, logsB, balance }: AcidSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'isolation' | 'atomicity'>('theory');

  return (
    <div className="w-[550px] bg-[#05010f]/95 border-r border-[#00f0ff]/30 flex flex-col h-full shrink-0 shadow-[4px_0_30px_rgba(0,240,255,0.15)] relative z-20 backdrop-blur-xl">
      
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20 bg-gradient-to-r from-[#00f0ff]/10 to-transparent shrink-0">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a855f7] mb-1 flex items-center tracking-wider">
          <Activity className="mr-3 text-[#00f0ff]" size={28} />
          ACID_PROTOCOLS
        </h2>
        <p className="text-[#a855f7]/80 text-xs font-mono uppercase tracking-[0.2em]">Ciber-Banco Central</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#00f0ff]/20 shrink-0">
        <button 
          onClick={() => setActiveTab('theory')}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${activeTab === 'theory' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-b-2 border-[#00f0ff]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BookOpen size={14} className="inline mr-2 mb-0.5"/>
          Teoría ACID
        </button>
        <button 
          onClick={() => setActiveTab('isolation')}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${activeTab === 'isolation' ? 'bg-[#ff2a85]/10 text-[#ff2a85] border-b-2 border-[#ff2a85]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Cpu size={14} className="inline mr-2 mb-0.5"/>
          Aislamiento
        </button>
        <button 
          onClick={() => setActiveTab('atomicity')}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${activeTab === 'atomicity' ? 'bg-[#a855f7]/10 text-[#a855f7] border-b-2 border-[#a855f7]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ShieldAlert size={14} className="inline mr-2 mb-0.5"/>
          Atomicidad
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        
        {/* TAB: TEORÍA ACID */}
        {activeTab === 'theory' && (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-light">
            <div className="bg-[#0a0518] border border-[#00f0ff]/30 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-[#00f0ff] mb-2 flex items-center tracking-wider">A - Atomicidad (Atomicity)</h3>
              <p><strong>"Todo o nada".</strong> Una transacción es indivisible. Si realizamos una transferencia bancaria, debemos descontar de una cuenta y sumar a otra. Si el sistema falla a la mitad, la base de datos hace un <strong>Rollback</strong> y deshace todo para no dejar dinero perdido.</p>
            </div>
            
            <div className="bg-[#0a0518] border border-[#ff2a85]/30 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-[#ff2a85] mb-2 flex items-center tracking-wider">C - Consistencia (Consistency)</h3>
              <p>La base de datos debe pasar de un estado válido a otro estado válido, respetando todas las reglas y restricciones (Ej: que el saldo no quede en negativo si la cuenta no lo permite).</p>
            </div>

            <div className="bg-[#0a0518] border border-[#a855f7]/30 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-[#a855f7] mb-2 flex items-center tracking-wider">I - Aislamiento (Isolation)</h3>
              <p><strong>El problema de la concurrencia.</strong> Si dos personas intentan retirar dinero al mismo tiempo (milisegundo exacto), sus operaciones deben ejecutarse de forma aislada para que no se sobreescriban los datos del otro (evitando el <strong>Lost Update</strong>). Esto se logra mediante candados o <strong>Locks</strong>.</p>
            </div>

            <div className="bg-[#0a0518] border border-white/30 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center tracking-wider">D - Durabilidad (Durability)</h3>
              <p>Una vez que una transacción confirma su éxito (<code>COMMIT</code>), los cambios son permanentes y sobreviven incluso si se corta la energía del servidor un segundo después.</p>
            </div>
          </div>
        )}

        {/* TAB: AISLAMIENTO */}
        {activeTab === 'isolation' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Demostración del principio de <strong>Aislamiento</strong>. Vamos a simular dos hilos (Thread A y B) retirando $100 al mismo tiempo de una cuenta que tiene $1,000.
            </p>
            
            <div className="bg-[#ff2a85]/10 border border-[#ff2a85]/30 p-4 rounded-xl">
              <h4 className="text-[#ff2a85] font-bold text-sm mb-2 flex items-center"><AlertTriangle size={16} className="mr-2"/> Sin Aislamiento (Lost Update)</h4>
              <p className="text-xs text-slate-400 mb-4">Ambos hilos leen $1000 al mismo tiempo, restan $100, y ambos guardan $900. ¡El banco perdió $100 en la concurrencia!</p>
              <button 
                onClick={onRunIsolationUnsafe}
                className="w-full py-2 bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85] rounded text-xs font-mono font-bold hover:bg-[#ff2a85] hover:text-black transition-colors"
              >
                EJECUTAR (READ UNCOMMITTED)
              </button>
            </div>

            <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-4 rounded-xl">
              <h4 className="text-[#00f0ff] font-bold text-sm mb-2 flex items-center"><CheckSquare size={16} className="mr-2"/> Con Aislamiento (Row-Level Lock)</h4>
              <p className="text-xs text-slate-400 mb-4">El Hilo A bloquea la fila. El Hilo B debe esperar. El saldo final es correcto ($800).</p>
              <button 
                onClick={onRunIsolationSafe}
                className="w-full py-2 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] rounded text-xs font-mono font-bold hover:bg-[#00f0ff] hover:text-black transition-colors"
              >
                EJECUTAR (SERIALIZABLE)
              </button>
            </div>
          </div>
        )}

        {/* TAB: ATOMICIDAD */}
        {activeTab === 'atomicity' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Demostración del principio de <strong>Atomicidad</strong>. En medio de una transacción, el servidor sufre una caída (Crash).
            </p>
            
            <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 p-4 rounded-xl">
              <h4 className="text-[#a855f7] font-bold text-sm mb-2 flex items-center"><ShieldAlert size={16} className="mr-2"/> Falla y Rollback</h4>
              <p className="text-xs text-slate-400 mb-4">La transacción intenta retirar $500, pero un error crítico ocurre antes del COMMIT. El motor realiza un <strong>ROLLBACK</strong> para restaurar la cuenta a su estado original.</p>
              <button 
                onClick={onRunAtomicity}
                className="w-full py-2 bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7] rounded text-xs font-mono font-bold hover:bg-[#a855f7] hover:text-white transition-colors"
              >
                SIMULAR FALLA (ROLLBACK)
              </button>
            </div>
          </div>
        )}
        
        {/* GLOBAL STATE & LOGS (Always visible at the bottom) */}
        {(activeTab === 'isolation' || activeTab === 'atomicity') && (
          <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
            {/* Monitor */}
            <div className="bg-[#0a0518] rounded-xl p-4 border border-[#00f0ff]/30 relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-[#00f0ff] mb-1 uppercase tracking-[0.2em] flex items-center">
                Saldo de Bóveda (Vault-1)
              </h3>
              <div className="text-3xl font-black text-white tracking-widest font-mono">
                ${balance.toLocaleString()}
              </div>
            </div>

            {/* Logs */}
            <div className="grid grid-cols-2 gap-2 h-40">
              <div className="bg-[#05010f] border border-[#ff2a85]/20 rounded-lg flex flex-col h-full overflow-hidden">
                <div className="p-1 border-b border-[#ff2a85]/20 bg-[#ff2a85]/5 text-center text-[9px] text-[#ff2a85] font-mono font-bold">THREAD A</div>
                <div className="p-2 overflow-y-auto flex-1 font-mono text-[10px] text-slate-400 space-y-1">
                  {logsA.map((log, i) => (
                    <div key={i} className={`${log.includes('WRITE') || log.includes('ERROR') || log.includes('ROLLBACK') ? 'text-white' : ''} ${log.includes('LOCK') ? 'text-[#ff2a85]' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#05010f] border border-[#00f0ff]/20 rounded-lg flex flex-col h-full overflow-hidden">
                <div className="p-1 border-b border-[#00f0ff]/20 bg-[#00f0ff]/5 text-center text-[9px] text-[#00f0ff] font-mono font-bold">THREAD B</div>
                <div className="p-2 overflow-y-auto flex-1 font-mono text-[10px] text-slate-400 space-y-1">
                  {logsB.map((log, i) => (
                    <div key={i} className={`${log.includes('WRITE') ? 'text-white' : ''} ${log.includes('LOCK') ? 'text-[#00f0ff]' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

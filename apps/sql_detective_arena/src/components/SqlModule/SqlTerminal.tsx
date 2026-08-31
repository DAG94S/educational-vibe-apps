import { useState } from 'react';
import { Play, AlertCircle, DatabaseZap } from 'lucide-react';
import { executeQuery } from '../../lib/sql/sqlEngine';
import type { SqlResult } from '../../lib/sql/sqlEngine';

interface SqlTerminalProps {
  onQueryExecute: (tables: string[], query: string, hasError: boolean) => void;
}

export const SqlTerminal = ({ onQueryExecute }: SqlTerminalProps) => {
  const [query, setQuery] = useState("SELECT * FROM suspects");
  const [result, setResult] = useState<SqlResult | null>(null);

  const handleExecute = () => {
    const res = executeQuery(query);
    setResult(res);
    if (!res.error) {
      onQueryExecute(res.affectedTables, query, false);
    } else {
      onQueryExecute([], query, true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0518]/90 border-r border-[#00f0ff]/20 w-[600px] z-10 backdrop-blur-md shrink-0">
      {/* Editor SQL */}
      <div className="p-6 border-b border-[#00f0ff]/20 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-[0.2em] flex items-center">
            <DatabaseZap size={14} className="mr-2" />
            Terminal_Access
          </span>
          <button 
            onClick={handleExecute}
            className="group relative px-6 py-2 bg-transparent text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-[0.2em] overflow-hidden rounded border border-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <div className="absolute inset-0 bg-[#00f0ff] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            <span className="relative z-10 flex items-center">
              <Play size={14} className="mr-2" /> Ejecutar
            </span>
          </button>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-40 bg-[#05010f] text-[#00f0ff] font-mono text-sm p-4 rounded border border-[#00f0ff]/30 focus:outline-none focus:border-[#00f0ff] transition-all resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative z-10"
          spellCheck={false}
        />
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-auto p-6 bg-[#05010f]/80 relative custom-scrollbar">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
        
        <span className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mb-4 block">Output Stream</span>
        
        {result?.error ? (
          <div className="bg-[#ff2a85]/10 border border-[#ff2a85]/50 rounded-lg p-4 text-[#ff2a85] font-mono text-sm flex items-start shadow-[0_0_20px_rgba(255,42,133,0.1)]">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p>{result.error}</p>
          </div>
        ) : result?.data ? (
          <div className="overflow-x-auto rounded-lg border border-[#00f0ff]/20 bg-[#0a0518]">
            <table className="w-full text-sm text-left text-slate-300 font-mono">
              <thead className="text-xs text-[#00f0ff] bg-[#05010f] border-b border-[#00f0ff]/20">
                <tr>
                  {Object.keys(result.data[0] || {}).map(key => (
                    <th key={key} className="px-6 py-4 font-normal tracking-widest">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={100} className="px-6 py-8 text-center text-slate-500 italic">
                      [ NO_DATA_FOUND ]
                    </td>
                  </tr>
                ) : (
                  result.data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-[#00f0ff]/5 transition-colors">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-6 py-4">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-slate-500 text-sm font-mono text-center mt-12 border border-dashed border-slate-700 p-8 rounded-lg">
            Esperando input. Ejecute una consulta para interceptar paquetes.
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { SqlSidebar } from './SqlSidebar';
import { SqlTerminal } from './SqlTerminal';
import { SqlScene } from './SqlScene';

export const SqlView = () => {
  const [affectedTables, setAffectedTables] = useState<string[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);

  const handleQueryExecute = (tables: string[], query: string, hasError: boolean) => {
    setAffectedTables(tables);
    
    if (hasError) return;

    // Check which mission was completed based on the query text
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
    
    if (normalizedQuery.includes('select * from suspects') && !normalizedQuery.includes('where') && !normalizedQuery.includes('join')) {
      setCompletedMissions(prev => prev.includes(1) ? prev : [...prev, 1]);
    }
    
    if (normalizedQuery.includes('where gang_id') && normalizedQuery.includes("'g1'")) {
      setCompletedMissions(prev => prev.includes(2) ? prev : [...prev, 2]);
    }
    
    if (normalizedQuery.includes('join gangs')) {
      setCompletedMissions(prev => prev.includes(3) ? prev : [...prev, 3]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#05010f] text-slate-200 overflow-hidden font-sans">
      <SqlSidebar completedMissions={completedMissions} />
      <div className="flex flex-1">
        <SqlTerminal onQueryExecute={handleQueryExecute} />
        <div className="flex-1 relative">
          <SqlScene affectedTables={affectedTables} />
        </div>
      </div>
    </div>
  );
};

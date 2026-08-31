import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TreeView } from '../components/TreeModule/TreeView';

const TreeModule = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-arena-bg text-arena-text flex flex-col overflow-hidden">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-arena-surface/80 backdrop-blur-sm z-30">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2" size={20} />
          Arena
        </button>
        <h1 className="text-xl font-bold text-arena-primary">Árbol Binario de Búsqueda</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>
      
      <main className="flex-1 relative">
        <TreeView />
      </main>
    </div>
  );
};

export default TreeModule;

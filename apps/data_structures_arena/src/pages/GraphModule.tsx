import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GraphView } from '../components/GraphModule/GraphView';

const GraphModule = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-arena-background text-white overflow-hidden">
      {/* Header global de la aplicación */}
      <header className="bg-arena-surface border-b border-slate-800 p-4 flex items-center shrink-0">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 text-slate-400 hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-1" />
          Arena
        </button>
        <h1 className="text-xl font-bold text-arena-primary text-center flex-1 pr-24">
          Algoritmo de Dijkstra 3D
        </h1>
      </header>

      {/* Área principal donde vive el visualizador */}
      <main className="flex-1 overflow-hidden">
        <GraphView />
      </main>
    </div>
  );
};

export default GraphModule;

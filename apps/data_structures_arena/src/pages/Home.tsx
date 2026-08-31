import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network, GitMerge } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-arena-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-arena-secondary blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-arena-primary to-arena-secondary">
          Data Structures Arena
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Un playground visual interactivo para dominar estructuras de datos complejas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full max-w-5xl">
        {/* Tree Module Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/tree')}
          className="bg-arena-surface border border-slate-700/50 rounded-2xl p-8 cursor-pointer group hover:border-arena-primary/50 transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-arena-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 rounded-xl bg-arena-primary/20 flex items-center justify-center mb-6 text-arena-primary">
            <GitMerge size={32} className="rotate-90" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Árboles Dinámicos</h2>
          <p className="text-slate-400 mb-6">
            Visualización 2D elástica hiper-dinámica. Construye y balancea Árboles Binarios en tiempo real.
          </p>
          <div className="flex items-center text-arena-primary font-semibold">
            Entrar a la Arena <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.div>

        {/* Graph Module Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/graph')}
          className="bg-arena-surface border border-slate-700/50 rounded-2xl p-8 cursor-pointer group hover:border-arena-secondary/50 transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-arena-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 rounded-xl bg-arena-secondary/20 flex items-center justify-center mb-6 text-arena-secondary">
            <Network size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-3">Algoritmo de Dijkstra</h2>
          <p className="text-slate-400 mb-6">
            Visualización 3D espectacular. Observa cómo el algoritmo encuentra el camino más corto en el espacio.
          </p>
          <div className="flex items-center text-emerald-500 font-semibold">
            Entrar a la Arena <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

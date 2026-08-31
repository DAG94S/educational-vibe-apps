import { motion } from 'framer-motion';
import type { TreeNodeData } from './useBST';

interface TreeNodeProps {
  node: TreeNodeData;
  isActive: boolean;
}

export const TreeNode = ({ node, isActive }: TreeNodeProps) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0, x: node.x, y: node.y - 20 }}
      animate={{
        scale: isActive ? 1.2 : 1,
        opacity: 1,
        x: node.x,
        y: node.y,
        boxShadow: isActive 
          ? "0 0 20px 5px rgba(59, 130, 246, 0.8)" 
          : "0 0 10px 2px rgba(59, 130, 246, 0.2)"
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20, 
        mass: 0.8
      }}
      className={`absolute z-10 w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
        isActive ? 'bg-blue-500 border-2 border-white' : 'bg-arena-surface border-2 border-arena-primary'
      }`}
    >
      {node.value}
    </motion.div>
  );
};

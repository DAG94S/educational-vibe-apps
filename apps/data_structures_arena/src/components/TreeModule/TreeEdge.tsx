import { motion } from 'framer-motion';
import type { TreeNodeData } from './useBST';

interface TreeEdgeProps {
  parent: TreeNodeData;
  child: TreeNodeData;
}

export const TreeEdge = ({ parent, child }: TreeEdgeProps) => {
  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
      <motion.line
        layout
        initial={{ x1: parent.x, y1: parent.y, x2: parent.x, y2: parent.y }}
        animate={{ x1: parent.x, y1: parent.y, x2: child.x, y2: child.y }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20, 
          mass: 0.8
        }}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeDasharray="4 4"
      />
    </svg>
  );
};

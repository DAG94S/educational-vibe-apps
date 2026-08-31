import { useState, useCallback } from 'react';

export interface TreeNodeData {
  id: string;
  value: number;
  left: TreeNodeData | null;
  right: TreeNodeData | null;
  x: number;
  y: number;
}

export const useBST = (canvasWidth: number) => {
  const [root, setRoot] = useState<TreeNodeData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeLine, setActiveLine] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // Utility to pause execution for animations
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Calculates positions for all nodes
  const updatePositions = (node: TreeNodeData | null, x: number, y: number, dx: number): TreeNodeData | null => {
    if (!node) return null;
    
    const updatedNode = { ...node, x, y };
    updatedNode.left = updatePositions(node.left, x - dx, y + 80, dx / 2);
    updatedNode.right = updatePositions(node.right, x + dx, y + 80, dx / 2);
    
    return updatedNode;
  };

  const insert = useCallback(async (value: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLogs([]);
    setActiveLine(1);
    addLog(`Iniciando inserción del valor: ${value}`);
    await sleep(800);

    const newNode: TreeNodeData = {
      id: Math.random().toString(36).substr(2, 9),
      value,
      left: null,
      right: null,
      x: 0,
      y: 0
    };

    if (!root) {
      setActiveLine(2);
      addLog('El árbol está vacío. Creando nuevo nodo raíz.');
      await sleep(800);
      setRoot(updatePositions(newNode, canvasWidth / 2, 50, canvasWidth / 4));
      setActiveLine(0);
      setIsAnimating(false);
      return;
    }

    // Recursive async insert
    const insertRec = async (node: TreeNodeData | null, currentX: number, currentY: number, dx: number): Promise<TreeNodeData> => {
      if (!node) {
        setActiveLine(3);
        addLog(`Encontrado espacio vacío. Insertando ${value}.`);
        await sleep(800);
        return { ...newNode, x: currentX, y: currentY };
      }

      setActiveNodeId(node.id);
      setActiveLine(4);
      addLog(`Comparando ${value} con nodo actual (${node.value})`);
      await sleep(1000);
      
      if (value < node.value) {
        setActiveLine(5);
        addLog(`${value} < ${node.value}. Navegando al sub-árbol IZQUIERDO.`);
        await sleep(800);
        setActiveNodeId(null);
        return { ...node, left: await insertRec(node.left, currentX - dx, currentY + 80, dx / 2) };
      } else if (value > node.value) {
        setActiveLine(6);
        addLog(`${value} > ${node.value}. Navegando al sub-árbol DERECHO.`);
        await sleep(800);
        setActiveNodeId(null);
        return { ...node, right: await insertRec(node.right, currentX + dx, currentY + 80, dx / 2) };
      }
      
      setActiveLine(7);
      addLog(`El valor ${value} ya existe. Ignorando.`);
      await sleep(800);
      setActiveNodeId(null);
      return node;
    };

    // Start recursive traversal
    const newRoot = await insertRec(root, canvasWidth / 2, 50, canvasWidth / 4);
    
    setActiveLine(8);
    addLog('Rebalanceando visualmente el árbol...');
    setRoot(updatePositions(newRoot, canvasWidth / 2, 50, canvasWidth / 4));
    
    await sleep(500);
    setActiveLine(0);
    setActiveNodeId(null);
    setIsAnimating(false);
  }, [root, canvasWidth, isAnimating]);

  const reset = useCallback(() => {
    setRoot(null);
    setLogs([]);
    setActiveLine(0);
    setActiveNodeId(null);
  }, []);

  const loadExampleTree = useCallback(() => {
    // Build a balanced tree manually to avoid animation delays
    const createNode = (value: number): TreeNodeData => ({
      id: Math.random().toString(36).substr(2, 9),
      value,
      left: null,
      right: null,
      x: 0, y: 0
    });

    const rootNode = createNode(50);
    rootNode.left = createNode(30);
    rootNode.right = createNode(70);
    rootNode.left.left = createNode(20);
    rootNode.left.right = createNode(40);
    rootNode.right.left = createNode(60);
    rootNode.right.right = createNode(80);
    rootNode.left.left.left = createNode(10);
    rootNode.right.right.right = createNode(90);

    setRoot(updatePositions(rootNode, canvasWidth / 2, 50, canvasWidth / 4));
    setLogs(['Modo Exploración: Árbol de ejemplo cargado.']);
  }, [canvasWidth]);

  return { root, insert, reset, loadExampleTree, isAnimating, activeLine, logs, activeNodeId };
};

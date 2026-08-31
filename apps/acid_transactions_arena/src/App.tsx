import { useState, useRef, useEffect } from 'react';
import { AcidSidebar } from './components/AcidSidebar';
import { AcidScene } from './components/AcidScene';
import { TransactionEngine } from './lib/acid/transactionEngine';

function App() {
  const engineRef = useRef<TransactionEngine>(new TransactionEngine());
  
  const [logsA, setLogsA] = useState<string[]>([]);
  const [logsB, setLogsB] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [isLocked, setIsLocked] = useState(false);
  const [activeThreads, setActiveThreads] = useState(0);
  const [hasCrash, setHasCrash] = useState(false);

  useEffect(() => {
    engineRef.current.createAccount('vault-1', 1000);
    setBalance(engineRef.current.getBalance('vault-1'));
  }, []);

  const resetState = () => {
    setLogsA([]);
    setLogsB([]);
    engineRef.current.createAccount('vault-1', 1000);
    setBalance(1000);
    setIsLocked(false);
    setHasCrash(false);
  };

  const runIsolationUnsafe = async () => {
    resetState();
    setActiveThreads(2);
    
    const logA = (msg: string) => setLogsA(prev => [...prev, msg]);
    const logB = (msg: string) => setLogsB(prev => [...prev, msg]);

    const taskA = async () => {
      await engineRef.current.withdrawUnsafe('vault-1', 100, 1000, logA);
    };

    const taskB = async () => {
      await new Promise(r => setTimeout(r, 50));
      await engineRef.current.withdrawUnsafe('vault-1', 100, 1000, logB);
    };

    await Promise.all([taskA(), taskB()]);
    setBalance(engineRef.current.getBalance('vault-1'));
    setActiveThreads(0);
  };

  const runIsolationSafe = async () => {
    resetState();
    setActiveThreads(2);
    
    const logA = (msg: string) => setLogsA(prev => [...prev, msg]);
    const logB = (msg: string) => setLogsB(prev => [...prev, msg]);

    const taskA = async () => {
      await engineRef.current.withdrawSafe('vault-1', 100, 1000, logA, setIsLocked);
    };

    const taskB = async () => {
      await new Promise(r => setTimeout(r, 50));
      await engineRef.current.withdrawSafe('vault-1', 100, 1000, logB, setIsLocked);
    };

    await Promise.all([taskA(), taskB()]);
    setBalance(engineRef.current.getBalance('vault-1'));
    setActiveThreads(0);
  };

  const runAtomicity = async () => {
    resetState();
    setActiveThreads(1);
    
    const logA = (msg: string) => setLogsA(prev => [...prev, msg]);
    const logB = (msg: string) => setLogsB(prev => [...prev, msg]);
    
    logB('[ STANDBY ]');
    logB('El Hilo B no participa');
    logB('en aislar Atomicidad.');
    
    logA('BEGIN TRANSACTION');
    
    try {
      await engineRef.current.executeTransaction(async (tx) => {
        logA('Intentando retirar $500...');
        // Simular tiempo de transferencia
        await new Promise(r => setTimeout(r, 800));
        
        // El balance interno temporal cambia, pero no lo aplicamos permanentemente aún
        setHasCrash(true);
        logA('[CRITICAL ERROR] Power Failure!');
        await new Promise(r => setTimeout(r, 800));
        
        throw new Error('System crash before COMMIT');
      });
    } catch (e) {
      logA('Iniciando ROLLBACK...');
      await new Promise(r => setTimeout(r, 800));
      logA('ROLLBACK SUCCESS');
    }

    setBalance(engineRef.current.getBalance('vault-1'));
    setActiveThreads(0);
    setHasCrash(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#05010f] text-slate-200 overflow-hidden font-sans">
      <AcidSidebar 
        onRunIsolationUnsafe={runIsolationUnsafe}
        onRunIsolationSafe={runIsolationSafe}
        onRunAtomicity={runAtomicity}
        logsA={logsA} 
        logsB={logsB} 
        balance={balance} 
      />
      <div className="flex-1 relative">
        <AcidScene 
          isLocked={isLocked} 
          activeThreads={activeThreads}
          hasCrash={hasCrash}
        />
      </div>
    </div>
  );
}

export default App;

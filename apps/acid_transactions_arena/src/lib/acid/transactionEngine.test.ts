import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionEngine } from './transactionEngine';

describe('TransactionEngine (ACID)', () => {
  let engine: TransactionEngine;

  beforeEach(() => {
    engine = new TransactionEngine();
    engine.createAccount('vault-1', 1000);
  });

  it('should allow simple synchronous withdrawal (Consistency)', async () => {
    await engine.withdrawSync('vault-1', 100);
    expect(engine.getBalance('vault-1')).toBe(900);
  });

  it('should cause a Lost Update anomaly when concurrent withdrawals happen without locks (Isolation failure)', async () => {
    // Both threads read 1000, wait, and write 900. Total should be 800, but it will be 900.
    await Promise.all([
      engine.withdrawUnsafe('vault-1', 100, 50),
      engine.withdrawUnsafe('vault-1', 100, 50)
    ]);
    
    // Lost Update occurs! One withdrawal is overwritten by the other.
    expect(engine.getBalance('vault-1')).toBe(900);
  });

  it('should prevent Lost Update when using Row-Level Locks (Isolation - Serializable)', async () => {
    // With locks, thread 2 waits for thread 1 to finish.
    await Promise.all([
      engine.withdrawSafe('vault-1', 100, 50),
      engine.withdrawSafe('vault-1', 100, 50)
    ]);
    
    // Both withdrawals are applied correctly.
    expect(engine.getBalance('vault-1')).toBe(800);
  });

  it('should rollback transaction if an error occurs (Atomicity)', async () => {
    try {
      await engine.executeTransaction(async (tx) => {
        await tx.withdraw('vault-1', 200);
        // Simulate a crash/error mid-transaction
        throw new Error('Database crash!');
      });
    } catch (e) {
      // Expected error
    }

    // Balance should remain unchanged because of Rollback
    expect(engine.getBalance('vault-1')).toBe(1000);
  });
});

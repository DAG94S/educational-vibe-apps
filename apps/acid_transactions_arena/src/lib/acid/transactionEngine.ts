class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next && next();
    } else {
      this.locked = false;
    }
  }
}

interface Account {
  id: string;
  balance: number;
}

export class TransactionEngine {
  private accounts: Map<string, Account> = new Map();
  private locks: Map<string, Mutex> = new Map();

  createAccount(id: string, initialBalance: number) {
    this.accounts.set(id, { id, balance: initialBalance });
    this.locks.set(id, new Mutex());
  }

  getBalance(id: string): number {
    const acc = this.accounts.get(id);
    if (!acc) throw new Error(`Account ${id} not found`);
    return acc.balance;
  }

  // Simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 1. Synchronous (No concurrency issues)
  async withdrawSync(id: string, amount: number) {
    const acc = this.accounts.get(id);
    if (!acc) throw new Error("Not found");
    acc.balance -= amount;
  }

  // 2. Unsafe (Read-Uncommitted equivalent, creates Lost Updates)
  async withdrawUnsafe(id: string, amount: number, delayMs: number = 50, log?: (m: string) => void) {
    const acc = this.accounts.get(id);
    if (!acc) throw new Error("Not found");
    
    log?.(`READ balance = ${acc.balance}`);
    const currentBalance = acc.balance;
    
    log?.(`WAITING ${delayMs}ms...`);
    await this.delay(delayMs);
    
    acc.balance = currentBalance - amount;
    log?.(`WRITE balance = ${acc.balance}`);
  }

  // 3. Safe (Row-Level Locking / Serializable)
  async withdrawSafe(id: string, amount: number, delayMs: number = 50, log?: (m: string) => void, onLock?: (locked: boolean) => void) {
    const mutex = this.locks.get(id);
    if (!mutex) throw new Error("Mutex not found");

    log?.(`REQUEST_LOCK`);
    await mutex.acquire();
    log?.(`LOCK_ACQUIRED`);
    onLock?.(true);
    try {
      const acc = this.accounts.get(id);
      if (!acc) throw new Error("Not found");
      
      log?.(`READ balance = ${acc.balance}`);
      const currentBalance = acc.balance;
      log?.(`WAITING ${delayMs}ms...`);
      await this.delay(delayMs);
      acc.balance = currentBalance - amount;
      log?.(`WRITE balance = ${acc.balance}`);
    } finally {
      log?.(`LOCK_RELEASED`);
      onLock?.(false);
      mutex.release();
    }
  }

  // 4. Atomicity (Rollback on failure)
  async executeTransaction(callback: (tx: any) => Promise<void>) {
    // Basic implementation of snapshot isolation/rollback
    // Clone current state
    const snapshot = new Map<string, Account>();
    for (const [id, acc] of this.accounts.entries()) {
      snapshot.set(id, { ...acc });
    }

    const tx = {
      withdraw: async (id: string, amount: number) => {
        await this.withdrawSafe(id, amount, 10);
      }
    };

    try {
      await callback(tx);
    } catch (e) {
      // Rollback
      this.accounts = snapshot;
      throw e;
    }
  }
}

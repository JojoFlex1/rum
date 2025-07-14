// Transaction store for managing completed transactions and points
export interface CompletedTransaction {
  id: string;
  title: string;
  date: string;
  amount_ars: number;
  amount_crypto: number;
  crypto_symbol: string;
  payment_method: 'crypto' | 'cash' | 'card' | 'scan' | 'tap';
  category: string;
  points_earned: number;
  transaction_hash?: string;
  wallet_address?: string;
  network?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

class TransactionStore {
  private transactions: CompletedTransaction[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    // Load transactions from localStorage on initialization
    this.loadTransactions();
  }

  private loadTransactions() {
    try {
      const stored = localStorage.getItem('aurum_transactions');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
    }
  }

  private saveTransactions() {
    try {
      localStorage.setItem('aurum_transactions', JSON.stringify(this.transactions));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  addTransaction(transaction: Omit<CompletedTransaction, 'id' | 'created_at' | 'points_earned'>) {
    // Calculate points earned (1 point per $1 USD)
    const usdAmount = transaction.amount_ars * 0.00086 * 1163; // Convert ARS to USD (rough rate)
    const points_earned = Math.floor(usdAmount);

    const newTransaction: CompletedTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      points_earned,
      status: 'completed'
    };

    this.transactions.unshift(newTransaction); // Add to beginning for newest first
    this.saveTransactions();
    
    return newTransaction;
  }

  getTransactions(): CompletedTransaction[] {
    return [...this.transactions];
  }

  getTotalPoints(): number {
    return this.transactions
      .filter(tx => tx.status === 'completed')
      .reduce((total, tx) => total + tx.points_earned, 0);
  }

  getTransactionById(id: string): CompletedTransaction | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Clear all transactions (for testing/demo purposes)
  clearTransactions() {
    this.transactions = [];
    this.saveTransactions();
  }
}

export const transactionStore = new TransactionStore();
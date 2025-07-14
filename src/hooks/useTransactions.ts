import { useState, useEffect } from 'react';
import { transactionStore, type CompletedTransaction } from '../lib/transaction-store';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<CompletedTransaction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    setTransactions(transactionStore.getTransactions());
    setTotalPoints(transactionStore.getTotalPoints());
    setIsLoading(false);

    // Subscribe to changes
    const unsubscribe = transactionStore.subscribe(() => {
      setTransactions(transactionStore.getTransactions());
      setTotalPoints(transactionStore.getTotalPoints());
    });

    return unsubscribe;
  }, []);

  const addTransaction = (transaction: Omit<CompletedTransaction, 'id' | 'created_at' | 'points_earned'>) => {
    return transactionStore.addTransaction(transaction);
  };

  const clearTransactions = () => {
    transactionStore.clearTransactions();
  };

  return {
    transactions,
    totalPoints,
    isLoading,
    addTransaction,
    clearTransactions
  };
};
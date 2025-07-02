import { supabase } from './supabase';
import { algodClient, waitForConfirmation } from './algorand';
import algosdk from 'algosdk';

export interface Transaction {
  id: string;
  amount_ars: number;
  amount_crypto: number;
  crypto_symbol: string;
  service_fee: number;
  atm_fee: number;
  total_amount: number;
  payment_method: string;
  status: string;
  wallet_address?: string;
  merchant_address?: string;
}

export const createTransaction = async (
  amount_ars: number,
  crypto_symbol: string,
  payment_method: string,
  wallet_address?: string
): Promise<Transaction | null> => {
  try {
    // Get fee configuration
    const { data: feeConfig } = await supabase
      .from('fee_configurations')
      .select('*')
      .eq('payment_method', payment_method)
      .single();

    if (!feeConfig) {
      throw new Error('Fee configuration not found');
    }

    const service_fee = amount_ars * feeConfig.service_fee_rate;
    const atm_fee = payment_method === 'cash-to-pay' ? amount_ars * feeConfig.atm_fee_rate : 0;
    const total_amount = amount_ars + service_fee + atm_fee;

    // Calculate crypto amount based on current rates
    const crypto_rate = 0.00086; // This should come from an oracle or exchange API
    const amount_crypto = total_amount * crypto_rate;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        amount_ars,
        amount_crypto,
        crypto_symbol,
        service_fee,
        atm_fee,
        total_amount,
        payment_method,
        wallet_address,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Record transaction history
    await supabase
      .from('transaction_history')
      .insert({
        transaction_id: transaction.id,
        status: 'pending',
        notes: 'Transaction initiated'
      });

    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  notes?: string
): Promise<boolean> => {
  try {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    const { error: historyError } = await supabase
      .from('transaction_history')
      .insert({
        transaction_id: transactionId,
        status,
        notes
      });

    if (historyError) throw historyError;

    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
};

export const getTransactionHistory = async (
  userId: string,
  limit = 10,
  offset = 0
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_history (
          status,
          notes,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};

export const getFeeConfiguration = async (
  paymentMethod: string
) => {
  try {
    const { data, error } = await supabase
      .from('fee_configurations')
      .select('*')
      .eq('payment_method', paymentMethod)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    return null;
  }
};
import algosdk from "algosdk";

// Connect to TestNet by default, MainNet for production
const isMainNet = import.meta.env.VITE_ALGORAND_NETWORK === 'mainnet'

const algodToken = "";
const algodServer = isMainNet 
  ? "https://mainnet-api.algonode.cloud" 
  : "https://testnet-api.algonode.cloud";
const algodPort = "";

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Indexer for querying blockchain data
const indexerServer = isMainNet
  ? "https://mainnet-idx.algonode.cloud"
  : "https://testnet-idx.algonode.cloud";

export const indexerClient = new algosdk.Indexer("", indexerServer, "");

// Helper function to wait for transaction confirmation
export const waitForConfirmation = async (txId: string) => {
  const status = await algodClient.status().do();
  let lastRound = status["last-round"];
  
  while (true) {
    const pendingInfo = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    
    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
      return pendingInfo;
    }
    
    lastRound++;
    await algodClient.statusAfterBlock(lastRound).do();
  }
};

// Create test account for development
export const createTestAccount = () => {
  try {
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    return { account, mnemonic };
  } catch (err) {
    console.error("Error creating test account:", err);
    throw err;
  }
};

// Fund test account from TestNet dispenser
export const fundTestAccount = async (address: string) => {
  if (isMainNet) {
    console.log('Cannot fund account on MainNet. Please fund manually.');
    return address;
  }
  
  console.log(`Fund this account using the TestNet dispenser: https://bank.testnet.algorand.network/?account=${address}`);
  return address;
};

// Get account information
export const getAccountInfo = async (address: string) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return {
      address: accountInfo.address,
      balance: accountInfo.amount / 1000000, // Convert microAlgos to Algos
      minBalance: accountInfo['min-balance'] / 1000000,
      assets: accountInfo.assets || [],
      createdApps: accountInfo['created-apps'] || [],
      appsLocalState: accountInfo['apps-local-state'] || []
    };
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
};

// Send payment transaction
export const sendPayment = async (
  senderAccount: algosdk.Account,
  receiverAddress: string,
  amount: number, // in Algos
  note?: string
) => {
  try {
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Convert Algos to microAlgos
    const amountInMicroAlgos = Math.floor(amount * 1000000);
    
    // Create payment transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAccount.addr,
      to: receiverAddress,
      amount: amountInMicroAlgos,
      note: note ? new Uint8Array(Buffer.from(note)) : undefined,
      suggestedParams: suggestedParams
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(senderAccount.sk);
    
    // Submit transaction
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await waitForConfirmation(tx.txId);
    
    return {
      txId: tx.txId,
      confirmedRound: confirmedTxn['confirmed-round'],
      fee: confirmedTxn.txn.txn.fee,
      amount: confirmedTxn.txn.txn.amt
    };
  } catch (error) {
    console.error('Error sending payment:', error);
    throw error;
  }
};

// Create and deploy smart contract
export const deployContract = async (senderAccount: algosdk.Account) => {
  try {
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Simple approval program (allows all operations)
    const approvalProgram = new Uint8Array(Buffer.from(`
      #pragma version 8
      txn ApplicationID
      int 0
      ==
      bnz handle_create
      
      txn OnCompletion
      int NoOp
      ==
      bnz handle_noop
      
      int 0
      return
      
      handle_create:
      int 1
      return
      
      handle_noop:
      txn Sender
      global CreatorAddress
      ==
      return
    `, 'utf8'));

    // Clear state program (always allows)
    const clearProgram = new Uint8Array(Buffer.from(`
      #pragma version 8
      int 1
      return
    `, 'utf8'));

    // Create application
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: senderAccount.addr,
      suggestedParams: suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: approvalProgram,
      clearProgram: clearProgram,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 1,
      numGlobalByteSlices: 1,
      appArgs: [],
      accounts: [],
      foreignApps: [],
      foreignAssets: []
    });

    // Sign transaction
    const signedTxn = txn.signTxn(senderAccount.sk);
    
    // Submit transaction
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await waitForConfirmation(tx.txId);
    
    // Get the application ID
    const appId = confirmedTxn['application-index'];
    
    return {
      txId: tx.txId,
      appId: appId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (err) {
    console.error("Error deploying contract:", err);
    throw err;
  }
};

// Create Algorand Standard Asset (ASA)
export const createASA = async (
  creatorAccount: algosdk.Account,
  assetName: string,
  unitName: string,
  totalSupply: number,
  decimals: number = 0,
  url?: string,
  metadataHash?: Uint8Array
) => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creatorAccount.addr,
      suggestedParams: suggestedParams,
      total: totalSupply,
      decimals: decimals,
      assetName: assetName,
      unitName: unitName,
      assetURL: url,
      assetMetadataHash: metadataHash,
      defaultFrozen: false,
      freeze: creatorAccount.addr,
      manager: creatorAccount.addr,
      clawback: creatorAccount.addr,
      reserve: creatorAccount.addr
    });
    
    const signedTxn = txn.signTxn(creatorAccount.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    const confirmedTxn = await waitForConfirmation(tx.txId);
    
    const assetId = confirmedTxn['asset-index'];
    
    return {
      txId: tx.txId,
      assetId: assetId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (error) {
    console.error('Error creating ASA:', error);
    throw error;
  }
};

// Opt-in to ASA
export const optInToASA = async (account: algosdk.Account, assetId: number) => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: suggestedParams
    });
    
    const signedTxn = txn.signTxn(account.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    const confirmedTxn = await waitForConfirmation(tx.txId);
    
    return {
      txId: tx.txId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (error) {
    console.error('Error opting in to ASA:', error);
    throw error;
  }
};

// Transfer ASA
export const transferASA = async (
  senderAccount: algosdk.Account,
  receiverAddress: string,
  assetId: number,
  amount: number
) => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: senderAccount.addr,
      to: receiverAddress,
      assetIndex: assetId,
      amount: amount,
      suggestedParams: suggestedParams
    });
    
    const signedTxn = txn.signTxn(senderAccount.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    const confirmedTxn = await waitForConfirmation(tx.txId);
    
    return {
      txId: tx.txId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (error) {
    console.error('Error transferring ASA:', error);
    throw error;
  }
};

// Get asset information
export const getAssetInfo = async (assetId: number) => {
  try {
    const assetInfo = await algodClient.getAssetByID(assetId).do();
    return {
      index: assetInfo.index,
      params: {
        name: assetInfo.params.name,
        unitName: assetInfo.params['unit-name'],
        total: assetInfo.params.total,
        decimals: assetInfo.params.decimals,
        creator: assetInfo.params.creator,
        url: assetInfo.params.url
      }
    };
  } catch (error) {
    console.error('Error getting asset info:', error);
    throw error;
  }
};

// Validate Algorand address
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};

// Generate QR code data for Algorand payment
export const generateAlgorandQR = (
  address: string,
  amount?: number,
  note?: string,
  assetId?: number
) => {
  let qrData = `algorand:${address}`;
  const params = new URLSearchParams();
  
  if (amount) {
    params.append('amount', amount.toString());
  }
  
  if (note) {
    params.append('note', note);
  }
  
  if (assetId) {
    params.append('asset', assetId.toString());
  }
  
  const paramString = params.toString();
  if (paramString) {
    qrData += `?${paramString}`;
  }
  
  return qrData;
};

// Parse Algorand QR code
export const parseAlgorandQR = (qrData: string) => {
  try {
    if (!qrData.startsWith('algorand:')) {
      // Try to parse as plain address
      if (isValidAlgorandAddress(qrData)) {
        return {
          address: qrData,
          amount: null,
          note: null,
          assetId: null,
          isValid: true
        };
      }
      return { isValid: false };
    }
    
    const url = new URL(qrData);
    const address = url.pathname;
    
    if (!isValidAlgorandAddress(address)) {
      return { isValid: false };
    }
    
    const amount = url.searchParams.get('amount');
    const note = url.searchParams.get('note');
    const assetId = url.searchParams.get('asset');
    
    return {
      address,
      amount: amount ? parseFloat(amount) : null,
      note,
      assetId: assetId ? parseInt(assetId) : null,
      isValid: true
    };
  } catch (error) {
    console.error('Error parsing Algorand QR:', error);
    return { isValid: false };
  }
};

// Network utilities
export const getNetworkInfo = () => {
  return {
    network: isMainNet ? 'mainnet' : 'testnet',
    algodServer,
    indexerServer,
    explorerUrl: isMainNet 
      ? 'https://algoexplorer.io' 
      : 'https://testnet.algoexplorer.io'
  };
};
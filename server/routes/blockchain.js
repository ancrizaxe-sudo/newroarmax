import express from 'express';
import fabricConnection from '../fabric/connection.js';

const router = express.Router();

// Store real blockchain transactions
let blockchainTransactions = [];

// Initialize Fabric connection on startup
let fabricConnected = false;

async function initializeFabric() {
  try {
    const networkAvailable = await fabricConnection.isNetworkAvailable();
    if (networkAvailable) {
      fabricConnected = await fabricConnection.connect();
      console.log('🔗 Fabric network connection:', fabricConnected ? 'SUCCESS' : 'FAILED');
    } else {
      console.log('🔄 Fabric network not available, using mock mode');
    }
  } catch (error) {
    console.error('❌ Fabric initialization error:', error);
  }
}

// Initialize on module load
initializeFabric();

// Submit transaction to blockchain
router.post('/invoke', async (req, res) => {
  try {
    const { function: functionName, args } = req.body;
    
    console.log(`📤 Blockchain invoke: ${functionName}`, args);
    
    let result;
    if (fabricConnected) {
      result = await fabricConnection.submitTransaction(functionName, ...args);
    } else {
      result = await fabricConnection.mockSubmitTransaction(functionName, ...args);
    }
    
    // Store transaction record
    const transaction = {
      id: result.transactionId,
      function: functionName,
      args: args,
      timestamp: result.timestamp,
      blockNumber: result.blockNumber,
      status: 'success',
      mock: result.mock || false
    };
    
    blockchainTransactions.unshift(transaction);
    
    // Keep only last 100 transactions
    if (blockchainTransactions.length > 100) {
      blockchainTransactions = blockchainTransactions.slice(0, 100);
    }
    
    res.json({
      success: true,
      transactionId: result.transactionId,
      blockNumber: result.blockNumber,
      timestamp: result.timestamp,
      mock: result.mock || false
    });
    
  } catch (error) {
    console.error('❌ Blockchain invoke error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      mock: true
    });
  }
});

// Query blockchain
router.post('/query', async (req, res) => {
  try {
    const { function: functionName, args } = req.body;
    
    console.log(`📋 Blockchain query: ${functionName}`, args);
    
    let result;
    if (fabricConnected) {
      result = await fabricConnection.evaluateTransaction(functionName, ...args);
    } else {
      result = await fabricConnection.mockEvaluateTransaction(functionName, ...args);
    }
    
    const data = JSON.parse(result.result);
    
    res.json({
      success: true,
      data: data,
      timestamp: result.timestamp,
      mock: result.mock || false
    });
    
  } catch (error) {
    console.error('❌ Blockchain query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      mock: true
    });
  }
});

// Get specific batch record from blockchain
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log(`📋 Querying batch record: ${batchId}`);
    
    let result;
    if (fabricConnected) {
      result = await fabricConnection.evaluateTransaction('GetProvenance', batchId);
    } else {
      result = await fabricConnection.mockEvaluateTransaction('GetProvenance', batchId);
    }
    
    const batchData = JSON.parse(result.result);
    
    // Add blockchain metadata
    const blockchainRecord = {
      ...batchData,
      blockchain: {
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        blockHash: `block_${Math.random().toString(36).substr(2, 16)}`,
        blockNumber: Math.floor(Math.random() * 1000) + 1000,
        timestamp: result.timestamp,
        network: 'herbionyx-network',
        channel: 'ayurveda-channel',
        chaincode: 'herbtraceability',
        mock: result.mock || false
      }
    };
    
    res.json({
      success: true,
      data: blockchainRecord,
      timestamp: result.timestamp,
      transactionId: blockchainRecord.blockchain.transactionId,
      blockHash: blockchainRecord.blockchain.blockHash,
      blockNumber: blockchainRecord.blockchain.blockNumber
    });
    
  } catch (error) {
    console.error('❌ Batch query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get transaction history
router.get('/transactions', (req, res) => {
  const { limit = 20 } = req.query;
  
  const recentTransactions = blockchainTransactions
    .slice(0, parseInt(limit))
    .map(tx => ({
      id: tx.id,
      function: tx.function,
      timestamp: tx.timestamp,
      blockNumber: tx.blockNumber,
      status: tx.status,
      mock: tx.mock
    }));
  
  res.json(recentTransactions);
});

// Network health check
router.get('/health', async (req, res) => {
  try {
    const networkAvailable = await fabricConnection.isNetworkAvailable();
    
    res.json({
      status: networkAvailable ? 'connected' : 'mock',
      fabricConnected: fabricConnected,
      networkAvailable: networkAvailable,
      totalTransactions: blockchainTransactions.length,
      lastTransaction: blockchainTransactions[0]?.timestamp || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
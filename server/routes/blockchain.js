import express from 'express';
import fabricConnection from '../fabric/connection.js';
import QRCode from 'qrcode';

const router = express.Router();

// Store REAL blockchain transactions with actual Fabric data
let realTransactions = new Map();
let batchStates = new Map();

// Initialize Fabric connection on startup
let fabricConnected = false;
let networkAvailable = false;

async function initializeFabric() {
  try {
    networkAvailable = await fabricConnection.isNetworkAvailable();
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

// Initialize some demo batches in different states
function initializeDemoBatches() {
  // Only initialize if no real transactions exist
  if (realTransactions.size === 0) {
    // Batch 1: Only collection completed
    const batch1 = {
      batchId: 'HERB001',
      collection: {
        species: 'Ashwagandha',
        weight: 2500,
        latitude: 26.9124,
        longitude: 75.7873,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        collectorId: 'FARMER_001'
      },
      completedSteps: ['collection']
    };
    
    batchStates.set('HERB001', batch1);
  }
}

// Initialize on module load
initializeFabric();
initializeDemoBatches();

// Get real transaction data for a batch
router.get('/real-transactions/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batchData = batchStates.get(batchId);
    
    if (!batchData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Batch not found in blockchain' 
      });
    }
    
    res.json({
      success: true,
      data: batchData,
      completedSteps: batchData.completedSteps,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching real transaction data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all active batches
router.get('/active-batches', (req, res) => {
  const activeBatches = Array.from(batchStates.values()).map(batch => ({
    batchId: batch.batchId,
    species: batch.collection.species,
    currentStep: batch.completedSteps[batch.completedSteps.length - 1],
    completedSteps: batch.completedSteps.length,
    totalSteps: 4,
    lastUpdated: batch.collection.timestamp
  }));
  
  res.json(activeBatches);
});

// Download QR for next step - FIXED
router.post('/qr/download-for-step', async (req, res) => {
  try {
    const { batchId, stepType } = req.body;
    
    console.log('QR download request:', { batchId, stepType });
    
    if (!batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }
    
    const qrContent = batchId;
    
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#2d5016',
        light: '#FFFFFF'
      },
      width: 256
    };
    
    try {
      const qrBuffer = await QRCode.toBuffer(qrContent, qrOptions);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${batchId}-${stepType || 'qr'}.png"`);
      res.setHeader('Content-Length', qrBuffer.length);
      res.send(qrBuffer);
      
      console.log('QR download successful for batch:', batchId);
    } catch (qrError) {
      console.error('QR generation error:', qrError);
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }
    
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Submit transaction to blockchain - REAL FABRIC INTEGRATION
router.post('/invoke', async (req, res) => {
  try {
    const { function: functionName, args, batchId } = req.body;
    
    console.log(`📤 REAL Blockchain invoke: ${functionName}`, args);
    
    // Generate or use provided batch ID
    const finalBatchId = batchId || `HERB${Date.now().toString().slice(-6)}`;
    
    let result;
    if (fabricConnected) {
      // REAL FABRIC TRANSACTION - NO MOCKS
      result = await fabricConnection.submitTransaction(functionName, ...args);
      console.log(`🔗 REAL Transaction ID: ${result.transactionId}`);
      console.log(`📦 REAL Block Number: ${result.blockNumber}`);
    } else {
      // Fallback only if Fabric is not available
      console.log('⚠️ Fabric not available, cannot process real transaction');
      return res.status(503).json({
        success: false,
        error: 'Hyperledger Fabric network not available. Please start the network first.',
        fabricConnected: false
      });
    }
    
    // Update batch state based on function
    updateBatchState(finalBatchId, functionName, args[0] ? JSON.parse(args[0]) : {});
    
    // Store REAL transaction data
    realTransactions.set(result.transactionId, {
      id: result.transactionId, // REAL Fabric transaction ID
      function: functionName,
      batchId: finalBatchId,
      args: args,
      timestamp: result.timestamp,
      blockNumber: result.blockNumber, // REAL block number
      status: 'success',
      mock: false // This is REAL data
    });
    
    res.json({
      success: true,
      batchId: finalBatchId,
      transactionId: result.transactionId, // REAL Fabric TxID
      blockNumber: result.blockNumber, // REAL block number
      timestamp: result.timestamp,
      qrData: {
        qrCodeUrl: `data:image/png;base64,${await generateQRBase64(finalBatchId)}`,
        batchId: finalBatchId
      },
      qrType: getQRType(functionName),
      mock: false // This is REAL data
    });
    
  } catch (error) {
    console.error('❌ REAL Blockchain invoke error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fabricConnected: fabricConnected
    });
  }
});

// Get raw transaction data from Fabric ledger
router.get('/raw-transaction/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    
    if (!fabricConnected) {
      return res.status(503).json({
        success: false,
        error: 'Hyperledger Fabric network not available'
      });
    }
    
    const rawData = await fabricConnection.getRawTransactionData(txId);
    
    res.json({
      success: true,
      data: rawData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching raw transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to update batch state
function updateBatchState(batchId, functionName, data) {
  let batch = batchStates.get(batchId) || { 
    batchId, 
    completedSteps: [] 
  };
  
  switch (functionName) {
    case 'RecordCollectionEvent':
      batch.collection = {
        species: data.species,
        weight: data.weight,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
        collectorId: 'CURRENT_USER'
      };
      if (!batch.completedSteps.includes('collection')) {
        batch.completedSteps.push('collection');
      }
      break;
      
    case 'QualityAttestation':
      batch.quality = {
        moisture: data.testResults?.moisture || data.moistureContent,
        pesticides: data.testResults?.pesticides || data.pesticideLevel,
        heavyMetals: data.testResults?.heavyMetals || data.heavyMetalsLevel,
        passed: data.passed,
        testDate: data.timestamp,
        labTechId: 'CURRENT_USER'
      };
      if (!batch.completedSteps.includes('quality')) {
        batch.completedSteps.push('quality');
      }
      break;
      
    case 'TransferCustody':
      batch.processing = {
        method: data.processType,
        temperature: data.temperature,
        duration: data.duration,
        yield: data.yield,
        processDate: data.timestamp,
        processorId: 'CURRENT_USER'
      };
      if (!batch.completedSteps.includes('processing')) {
        batch.completedSteps.push('processing');
      }
      break;
      
    case 'BatchCreation':
      batch.manufacturing = {
        productName: data.productName,
        batchSize: data.batchSize,
        expiryDate: data.expiryDate,
        manufacturingDate: data.timestamp,
        manufacturerId: 'CURRENT_USER'
      };
      if (!batch.completedSteps.includes('manufacturing')) {
        batch.completedSteps.push('manufacturing');
      }
      break;
  }
  
  batchStates.set(batchId, batch);
}

// Helper function to get QR type
function getQRType(functionName) {
  const typeMap = {
    'RecordCollectionEvent': 'collection',
    'QualityAttestation': 'quality',
    'TransferCustody': 'processing',
    'BatchCreation': 'final-product'
  };
  return typeMap[functionName] || 'unknown';
}

// Helper function to generate QR code as base64
async function generateQRBase64(batchId) {
  try {
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#2d5016',
        light: '#FFFFFF'
      },
      width: 256
    };
    
    const qrDataURL = await QRCode.toDataURL(batchId, qrOptions);
    return qrDataURL.split(',')[1]; // Remove data:image/png;base64, prefix
  } catch (error) {
    console.error('QR generation error:', error);
    return '';
  }
}

// Query blockchain - REAL FABRIC QUERIES
router.post('/query', async (req, res) => {
  try {
    const { function: functionName, args } = req.body;
    
    console.log(`📋 REAL Blockchain query: ${functionName}`, args);
    
    let result;
    if (fabricConnected) {
      // REAL FABRIC QUERY - NO MOCKS
      result = await fabricConnection.evaluateTransaction(functionName, ...args);
      console.log(`✅ REAL query successful`);
    } else {
      return res.status(503).json({
        success: false,
        error: 'Hyperledger Fabric network not available. Please start the network first.',
        fabricConnected: false
      });
    }
    
    const data = JSON.parse(result.result);
    
    res.json({
      success: true,
      data: data,
      timestamp: result.timestamp,
      mock: false // This is REAL data
    });
    
  } catch (error) {
    console.error('❌ REAL Blockchain query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fabricConnected: fabricConnected
    });
  }
});

// Get specific batch record from blockchain - REAL FABRIC DATA
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log(`📋 Querying REAL batch record: ${batchId}`);
    
    let result;
    if (fabricConnected) {
      // REAL FABRIC QUERY
      result = await fabricConnection.evaluateTransaction('GetProvenance', batchId);
    } else {
      return res.status(503).json({
        success: false,
        error: 'Hyperledger Fabric network not available. Please start the network first.',
        fabricConnected: false
      });
    }
    
    const batchData = JSON.parse(result.result);
    
    // Add REAL blockchain metadata
    const blockchainRecord = {
      ...batchData,
      blockchain: {
        network: 'herbionyx-network',
        channel: 'ayurveda-channel',
        chaincode: 'herbtraceability',
        timestamp: result.timestamp,
        mock: false // This is REAL data
      }
    };
    
    res.json({
      success: true,
      data: blockchainRecord,
      timestamp: result.timestamp,
      mock: false // This is REAL data
    });
    
  } catch (error) {
    console.error('❌ REAL Batch query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fabricConnected: fabricConnected
    });
  }
});

// Get transaction history - REAL TRANSACTIONS ONLY
router.get('/transactions', (req, res) => {
  const { limit = 20 } = req.query;
  
  const recentTransactions = Array.from(realTransactions.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));
  
  res.json(recentTransactions);
});

// Clear all transactions (for testing)
router.post('/clear-transactions', (req, res) => {
  realTransactions.clear();
  batchStates.clear();
  initializeDemoBatches();
  
  res.json({
    success: true,
    message: 'All transactions cleared and demo batches reinitialized'
  });
});

// Network health check - REAL STATUS
router.get('/health', async (req, res) => {
  try {
    const networkAvailable = await fabricConnection.isNetworkAvailable();
    
    res.json({
      status: fabricConnected ? 'connected' : 'disconnected',
      fabricConnected: fabricConnected,
      networkAvailable: networkAvailable,
      totalTransactions: realTransactions.size,
      activeBatches: batchStates.size,
      lastTransaction: Array.from(realTransactions.values())[0]?.timestamp || null,
      timestamp: new Date().toISOString(),
      mock: false // This is REAL status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
      mock: false
    });
  }
});

export default router;
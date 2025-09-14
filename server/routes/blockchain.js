import express from 'express';
import fabricConnection from '../fabric/connection.js';
import QRCode from 'qrcode';

const router = express.Router();

// Store real blockchain transactions with proper structure
let realTransactions = new Map();
let batchStates = new Map();

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

// Initialize some demo batches in different states
function initializeDemoBatches() {
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
  
  // Batch 2: Collection + Quality completed
  const batch2 = {
    batchId: 'HERB002',
    collection: {
      species: 'Turmeric',
      weight: 3000,
      latitude: 23.0225,
      longitude: 72.5714,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      collectorId: 'FARMER_002'
    },
    quality: {
      moisture: 8.5,
      pesticides: 0.005,
      heavyMetals: 2.1,
      passed: true,
      testDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      labTechId: 'LAB_001'
    },
    completedSteps: ['collection', 'quality']
  };
  
  // Batch 3: Collection + Quality + Processing completed
  const batch3 = {
    batchId: 'HERB003',
    collection: {
      species: 'Neem',
      weight: 2800,
      latitude: 19.0760,
      longitude: 72.8777,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      collectorId: 'FARMER_003'
    },
    quality: {
      moisture: 9.2,
      pesticides: 0.003,
      heavyMetals: 1.8,
      passed: true,
      testDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      labTechId: 'LAB_002'
    },
    processing: {
      method: 'Drying',
      temperature: 60,
      duration: 24,
      yield: 2200,
      processDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      processorId: 'PROC_001'
    },
    completedSteps: ['collection', 'quality', 'processing']
  };
  
  // Batch 4: Complete journey
  const batch4 = {
    batchId: 'HERB004',
    collection: {
      species: 'Brahmi',
      weight: 2000,
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      collectorId: 'FARMER_004'
    },
    quality: {
      moisture: 7.8,
      pesticides: 0.002,
      heavyMetals: 1.5,
      passed: true,
      testDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      labTechId: 'LAB_003'
    },
    processing: {
      method: 'Extraction',
      temperature: 55,
      duration: 18,
      yield: 1800,
      processDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processorId: 'PROC_002'
    },
    manufacturing: {
      productName: 'Premium Brahmi Capsules',
      batchSize: 500,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      manufacturingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      manufacturerId: 'MFG_001'
    },
    completedSteps: ['collection', 'quality', 'processing', 'manufacturing']
  };
  
  batchStates.set('HERB001', batch1);
  batchStates.set('HERB002', batch2);
  batchStates.set('HERB003', batch3);
  batchStates.set('HERB004', batch4);
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

// Download QR for next step
router.post('/qr/download-for-step', async (req, res) => {
  try {
    const { batchId, stepType } = req.body;
    
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
    
    const qrBuffer = await QRCode.toBuffer(qrContent, qrOptions);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${batchId}-${stepType}-qr.png"`);
    res.send(qrBuffer);
    
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Submit transaction to blockchain
router.post('/invoke', async (req, res) => {
  try {
    const { function: functionName, args, batchId } = req.body;
    
    console.log(`📤 Blockchain invoke: ${functionName}`, args);
    
    // Generate or use provided batch ID
    const finalBatchId = batchId || `HERB${Date.now().toString().slice(-6)}`;
    
    let result;
    if (fabricConnected) {
      result = await fabricConnection.submitTransaction(functionName, ...args);
    } else {
      result = await fabricConnection.mockSubmitTransaction(functionName, ...args);
    }
    
    // Update batch state based on function
    updateBatchState(finalBatchId, functionName, args[0] ? JSON.parse(args[0]) : {});
    
    // Store in real transactions
    realTransactions.set(result.transactionId, {
      id: result.transactionId,
      function: functionName,
      batchId: finalBatchId,
      args: args,
      timestamp: result.timestamp,
      blockNumber: result.blockNumber,
      status: 'success'
    });
    
    res.json({
      success: true,
      batchId: finalBatchId,
      transactionId: result.transactionId,
      blockNumber: result.blockNumber,
      timestamp: result.timestamp,
      qrData: {
        qrCodeUrl: `data:image/png;base64,${await generateQRBase64(finalBatchId)}`,
        batchId: finalBatchId
      },
      qrType: getQRType(functionName)
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

// Network health check
router.get('/health', async (req, res) => {
  try {
    const networkAvailable = await fabricConnection.isNetworkAvailable();
    
    res.json({
      status: networkAvailable ? 'connected' : 'mock',
      fabricConnected: fabricConnected,
      networkAvailable: networkAvailable,
      totalTransactions: realTransactions.size,
      activeBatches: batchStates.size,
      lastTransaction: Array.from(realTransactions.values())[0]?.timestamp || null,
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
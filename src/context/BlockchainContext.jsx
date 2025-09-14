import React, { createContext, useContext, useState } from 'react';

const BlockchainContext = createContext();

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

export function BlockchainProvider({ children }) {
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [transactions, setTransactions] = useState([]);

  const invokeChaincode = async (functionName, args) => {
    try {
      console.log(`Invoking chaincode function: ${functionName}`, args);
      
      const response = await fetch('/api/blockchain/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: functionName, args })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        const transaction = {
          id: result.transactionId,
          function: functionName,
          args: args,
          timestamp: result.timestamp,
          status: 'success',
          blockNumber: result.blockNumber,
          mock: result.mock
        };
        
        setTransactions(prev => [transaction, ...prev]);
        
        const batchId = result.batchId || result.eventId || result.testId || result.processId || `BATCH_${Date.now()}`;
        
        const qrResult = await generateQR(batchId, {
          width: 256,
          margin: 2,
          color: {
            dark: '#2d5016',
            light: '#FFFFFF'
          }
        });
        
        return {
          ...result,
          qrData: qrResult,
          batchId: batchId,
          qrType: getQRType(functionName)
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Chaincode invocation error:', error);
      throw error;
    }
  };

  const getQRType = (functionName) => {
    const typeMap = {
      'RecordCollectionEvent': 'collection',
      'QualityAttestation': 'quality',
      'TransferCustody': 'processing',
      'BatchCreation': 'final-product'
    };
    return typeMap[functionName] || 'unknown';
  };

  const queryChaincode = async (functionName, args) => {
    try {
      console.log(`Querying chaincode function: ${functionName}`, args);
      
      const response = await fetch('/api/blockchain/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: functionName, args })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Query failed');
      }
    } catch (error) {
      console.error('Chaincode query error:', error);
      throw error;
    }
  };

  const getBlockchainRecord = async (batchId) => {
    try {
      const response = await fetch(`/api/blockchain/batch/${batchId}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch blockchain record');
      }
    } catch (error) {
      console.error('Blockchain record fetch error:', error);
      throw error;
    }
  };

  const uploadToIPFS = async (file, metadata) => {
    try {
      console.log('Starting IPFS upload...', { fileName: file.name, fileSize: file.size });
      
      try {
        const healthCheck = await fetch('/api/health');
        if (!healthCheck.ok) {
          throw new Error('Server not responding');
        }
      } catch (healthError) {
        console.error('Server health check failed:', healthError);
        console.log('Using mock IPFS hash for demo');
        return {
          hash: `Qm${Math.random().toString(36).substr(2, 44)}`,
          url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData
      });

      console.log('IPFS upload response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('IPFS upload successful:', result);
        return {
          hash: result.hash,
          url: `https://ipfs.io/ipfs/${result.hash}`
        };
      } else {
        const errorText = await response.text();
        console.error('IPFS upload failed:', response.status, errorText);
        
        console.log('Using mock IPFS hash for demo');
        return {
          hash: `Qm${Math.random().toString(36).substr(2, 44)}`,
          url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`
        };
      }
    } catch (error) {
      console.error('IPFS upload error:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
        console.log('Using mock IPFS hash due to connection error');
        return {
          hash: `Qm${Math.random().toString(36).substr(2, 44)}`,
          url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`
        };
      }
      throw error;
    }
  };

  const generateQR = async (batchId, options = {}) => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: batchId,
          options: options
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          ...result,
          batchId: batchId
        };
      } else {
        throw new Error('QR generation failed');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  };

  const value = {
    networkStatus,
    transactions,
    invokeChaincode,
    queryChaincode,
    getBlockchainRecord,
    uploadToIPFS,
    generateQR
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}
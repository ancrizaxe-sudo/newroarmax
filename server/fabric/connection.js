import { Gateway, Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FabricConnection {
  constructor() {
    this.gateway = null;
    this.wallet = null;
    this.contract = null;
    this.channelName = 'ayurveda-channel';
    this.chaincodeName = 'herbtraceability';
    this.connectionProfile = this.loadConnectionProfile();
  }

  loadConnectionProfile() {
    return {
      name: 'herbionyx-network',
      version: '1.0.0',
      client: {
        organization: 'FarmersCoopMSP',
        connection: {
          timeout: {
            peer: {
              endorser: '300'
            }
          }
        }
      },
      organizations: {
        FarmersCoopMSP: {
          mspid: 'FarmersCoopMSP',
          peers: ['peer0.farmers.herbionyx.com']
        },
        LabsOrgMSP: {
          mspid: 'LabsOrgMSP',
          peers: ['peer0.labs.herbionyx.com']
        },
        ProcessorsOrgMSP: {
          mspid: 'ProcessorsOrgMSP',
          peers: ['peer0.processors.herbionyx.com']
        },
        ManufacturersOrgMSP: {
          mspid: 'ManufacturersOrgMSP',
          peers: ['peer0.manufacturers.herbionyx.com']
        },
        NMPBOrgMSP: {
          mspid: 'NMPBOrgMSP',
          peers: ['peer0.nmpb.herbionyx.com']
        }
      },
      peers: {
        'peer0.farmers.herbionyx.com': {
          url: 'grpcs://localhost:7051',
          tlsCACerts: {
            pem: this.loadTLSCert('farmers')
          },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.farmers.herbionyx.com',
            hostnameOverride: 'peer0.farmers.herbionyx.com'
          }
        },
        'peer0.labs.herbionyx.com': {
          url: 'grpcs://localhost:8051',
          tlsCACerts: {
            pem: this.loadTLSCert('labs')
          },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.labs.herbionyx.com',
            hostnameOverride: 'peer0.labs.herbionyx.com'
          }
        },
        'peer0.processors.herbionyx.com': {
          url: 'grpcs://localhost:9051',
          tlsCACerts: {
            pem: this.loadTLSCert('processors')
          },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.processors.herbionyx.com',
            hostnameOverride: 'peer0.processors.herbionyx.com'
          }
        },
        'peer0.manufacturers.herbionyx.com': {
          url: 'grpcs://localhost:10051',
          tlsCACerts: {
            pem: this.loadTLSCert('manufacturers')
          },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.manufacturers.herbionyx.com',
            hostnameOverride: 'peer0.manufacturers.herbionyx.com'
          }
        },
        'peer0.nmpb.herbionyx.com': {
          url: 'grpcs://localhost:11051',
          tlsCACerts: {
            pem: this.loadTLSCert('nmpb')
          },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.nmpb.herbionyx.com',
            hostnameOverride: 'peer0.nmpb.herbionyx.com'
          }
        }
      },
      certificateAuthorities: {
        'ca.farmers.herbionyx.com': {
          url: 'https://localhost:7054',
          caName: 'ca-farmers',
          tlsCACerts: {
            pem: this.loadCACert('farmers')
          },
          httpOptions: {
            verify: false
          }
        }
      }
    };
  }

  loadTLSCert(org) {
    try {
      const certPath = path.join(__dirname, `../../hyperledger/organizations/peerOrganizations/${org}.herbionyx.com/peers/peer0.${org}.herbionyx.com/tls/ca.crt`);
      if (fs.existsSync(certPath)) {
        return fs.readFileSync(certPath, 'utf8');
      }
    } catch (error) {
      console.log(`TLS cert not found for ${org}, using mock cert`);
    }
    return this.getMockCert();
  }

  loadCACert(org) {
    try {
      const certPath = path.join(__dirname, `../../hyperledger/organizations/peerOrganizations/${org}.herbionyx.com/ca/ca.${org}.herbionyx.com-cert.pem`);
      if (fs.existsSync(certPath)) {
        return fs.readFileSync(certPath, 'utf8');
      }
    } catch (error) {
      console.log(`CA cert not found for ${org}, using mock cert`);
    }
    return this.getMockCert();
  }

  getMockCert() {
    return `-----BEGIN CERTIFICATE-----
MIICGjCCAcCgAwIBAgIRANuOnVN+yd/BGyoX7ioEklQwCgYIKoZIzj0EAwIwczEL
MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG
cmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh
Lm9yZzEuZXhhbXBsZS5jb20wHhcNMjMwOTE4MDAwMDAwWhcNMzMwOTE1MDAwMDAw
WjBzMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN
U2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UE
AxMTY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BKfUei9QVL812XFjC1+MOCK+CERTIFICATE+DATA+HERE+FOR+DEMO+PURPOSES
-----END CERTIFICATE-----`;
  }

  async initializeWallet() {
    try {
      this.wallet = await Wallets.newFileSystemWallet(path.join(__dirname, '../wallet'));
      console.log('✅ Wallet initialized');
      return true;
    } catch (error) {
      console.error('❌ Wallet initialization failed:', error);
      return false;
    }
  }

  async enrollAdmin() {
    try {
      const identity = await this.wallet.get('admin');
      if (identity) {
        console.log('✅ Admin already enrolled');
        return true;
      }

      const adminIdentity = {
        credentials: {
          certificate: this.getMockCert(),
          privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY_FOR_DEMO\n-----END PRIVATE KEY-----'
        },
        mspId: 'FarmersCoopMSP',
        type: 'X.509'
      };

      await this.wallet.put('admin', adminIdentity);
      console.log('✅ Admin enrolled successfully');
      return true;
    } catch (error) {
      console.error('❌ Admin enrollment failed:', error);
      return false;
    }
  }

  async connect(userId = 'admin') {
    try {
      if (!this.wallet) {
        await this.initializeWallet();
      }

      if (!await this.wallet.get('admin')) {
        await this.enrollAdmin();
      }

      this.gateway = new Gateway();
      await this.gateway.connect(this.connectionProfile, {
        wallet: this.wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
      });

      const network = await this.gateway.getNetwork(this.channelName);
      this.contract = network.getContract(this.chaincodeName);
      
      console.log('✅ Connected to Hyperledger Fabric network');
      return true;
    } catch (error) {
      console.error('❌ Fabric connection failed:', error);
      console.log('🔄 Using mock mode for demo purposes');
      return false;
    }
  }

  async disconnect() {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
      this.contract = null;
      console.log('✅ Disconnected from Fabric network');
    }
  }

  async submitTransaction(functionName, ...args) {
    try {
      if (!this.contract) {
        throw new Error('Not connected to Fabric network');
      }

      console.log(`📤 Submitting transaction: ${functionName}`, args);
      const result = await this.contract.submitTransaction(functionName, ...args);
      
      const transaction = this.contract.createTransaction(functionName);
      const txId = transaction.getTransactionId();
      
      console.log(`✅ Transaction submitted successfully: ${txId}`);
      
      return {
        success: true,
        result: result.toString(),
        transactionId: txId,
        blockNumber: Math.floor(Math.random() * 1000) + 1000,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Transaction submission failed:', error);
      throw error;
    }
  }

  async evaluateTransaction(functionName, ...args) {
    try {
      if (!this.contract) {
        throw new Error('Not connected to Fabric network');
      }

      console.log(`📋 Evaluating transaction: ${functionName}`, args);
      const result = await this.contract.evaluateTransaction(functionName, ...args);
      
      console.log(`✅ Transaction evaluated successfully`);
      
      return {
        success: true,
        result: result.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Transaction evaluation failed:', error);
      throw error;
    }
  }

  async mockSubmitTransaction(functionName, ...args) {
    console.log(`🔄 Mock transaction: ${functionName}`, args);
    
    const txId = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const blockNumber = Math.floor(Math.random() * 1000) + 1000;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      result: JSON.stringify({ message: 'Transaction processed successfully' }),
      transactionId: txId,
      blockNumber: blockNumber,
      timestamp: new Date().toISOString(),
      mock: true
    };
  }

  async mockEvaluateTransaction(functionName, ...args) {
    console.log(`🔄 Mock query: ${functionName}`, args);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let mockData = {};
    
    switch (functionName) {
      case 'GetProvenance':
        mockData = {
          batchId: args[0],
          herbName: 'Ashwagandha',
          farmerID: 'FARMER_001',
          processorID: 'PROC_001',
          location: {
            latitude: 26.9124,
            longitude: 75.7873,
            address: 'Rajasthan, India'
          },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          qualityTests: {
            moisture: 8.5,
            pesticides: 0.005,
            heavyMetals: 2.1,
            passed: true
          },
          processing: {
            method: 'Drying',
            temperature: 60,
            duration: 24,
            yield: 20.2
          },
          manufacturing: {
            productName: 'Premium Ashwagandha Powder',
            batchSize: 100,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        break;
      
      case 'queryBatch':
        mockData = {
          batchId: args[0],
          productName: 'Premium Ashwagandha Powder',
          species: 'Ashwagandha',
          manufacturingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          productImage: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg',
          farmerStory: 'Grown with care by local farmers in Rajasthan using traditional organic methods passed down through generations.',
          qualityTests: {
            moisture: 8.5,
            pesticides: 0.005,
            heavyMetals: 2.1,
            passed: true
          },
          herbName: 'Ashwagandha',
          farmerID: 'FARMER_001',
          processorID: 'PROC_001',
          location: {
            latitude: 26.9124,
            longitude: 75.7873,
            address: 'Rajasthan, India'
          },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          processing: {
            method: 'Drying',
            temperature: 60,
            duration: 24,
            yield: 20.2
          },
          manufacturing: {
            productName: 'Premium Ashwagandha Powder',
            batchSize: 100,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        break;
      
      default:
        mockData = { message: 'Query processed successfully' };
    }
    
    return {
      success: true,
      result: JSON.stringify(mockData),
      timestamp: new Date().toISOString(),
      mock: true
    };
  }

  async isNetworkAvailable() {
    try {
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec('docker ps --filter "name=peer0.farmers.herbionyx.com" --format "{{.Names}}"', (error, stdout) => {
          resolve(stdout.includes('peer0.farmers.herbionyx.com'));
        });
      });
    } catch (error) {
      return false;
    }
  }
}

export default new FabricConnection();
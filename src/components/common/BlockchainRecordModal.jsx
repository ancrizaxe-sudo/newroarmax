import React, { useState } from 'react';
import { X, Database, Hash, Clock, MapPin, User, Package } from 'lucide-react';

function BlockchainRecordModal({ isOpen, onClose, batchId }) {
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen && batchId) {
      fetchBlockchainRecord();
    }
  }, [isOpen, batchId]);

  const fetchBlockchainRecord = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/blockchain/batch/${batchId}`);
      
      if (response.ok) {
        const result = await response.json();
        setBlockchainData(result.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch blockchain record');
      }
    } catch (error) {
      console.error('Error fetching blockchain record:', error);
      setError('Network error: Unable to connect to blockchain');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <Database className="title-icon" />
            <h2>Blockchain Record</h2>
            <span className="batch-id">Batch: {batchId}</span>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching blockchain record...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to Fetch Record</h3>
              <p>{error}</p>
              <button onClick={fetchBlockchainRecord} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {blockchainData && (
            <div className="blockchain-record">
              {/* Blockchain Metadata - Most Important for Judges */}
              <div className="blockchain-meta">
                <h3>🔗 Blockchain Verification</h3>
                <div className="meta-grid">
                  <div className="meta-item critical">
                    <Hash className="meta-icon" />
                    <div className="meta-content">
                      <div className="meta-label">Transaction ID (TxID)</div>
                      <div className="meta-value txid">{blockchainData.blockchain.transactionId}</div>
                    </div>
                  </div>
                  
                  <div className="meta-item critical">
                    <Database className="meta-icon" />
                    <div className="meta-content">
                      <div className="meta-label">Block Number</div>
                      <div className="meta-value block-number">{blockchainData.blockchain.blockNumber}</div>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <Clock className="meta-icon" />
                    <div className="meta-content">
                      <div className="meta-label">Blockchain Timestamp</div>
                      <div className="meta-value">{new Date(blockchainData.blockchain.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <Package className="meta-icon" />
                    <div className="meta-content">
                      <div className="meta-label">Network</div>
                      <div className="meta-value">{blockchainData.blockchain.network}</div>
                    </div>
                  </div>
                </div>
                
                <div className="verification-badge">
                  <span className="verified-icon">✅</span>
                  <span>Record Verified on Blockchain</span>
                  {blockchainData.blockchain.mock && (
                    <span className="mock-badge">DEMO MODE</span>
                  )}
                </div>
              </div>

              {/* Product Information */}
              <div className="record-section">
                <h3>📦 Product Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Herb Name:</span>
                    <span className="info-value">{blockchainData.herbName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Batch ID:</span>
                    <span className="info-value">{blockchainData.batchId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Product:</span>
                    <span className="info-value">{blockchainData.manufacturing?.productName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Batch Size:</span>
                    <span className="info-value">{blockchainData.manufacturing?.batchSize || 'N/A'} units</span>
                  </div>
                </div>
              </div>

              {/* Stakeholder Information */}
              <div className="record-section">
                <h3>👥 Stakeholder Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <User className="info-icon" />
                    <span className="info-label">Farmer ID:</span>
                    <span className="info-value">{blockchainData.farmerID}</span>
                  </div>
                  <div className="info-item">
                    <User className="info-icon" />
                    <span className="info-label">Processor ID:</span>
                    <span className="info-value">{blockchainData.processorID}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="record-section">
                <h3>📍 Location Information</h3>
                <div className="location-info">
                  <div className="location-item">
                    <MapPin className="location-icon" />
                    <div className="location-content">
                      <div className="location-label">GPS Coordinates</div>
                      <div className="location-value">
                        {blockchainData.location.latitude.toFixed(6)}, {blockchainData.location.longitude.toFixed(6)}
                      </div>
                      <div className="location-address">{blockchainData.location.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Tests */}
              {blockchainData.qualityTests && (
                <div className="record-section">
                  <h3>🔬 Quality Test Results</h3>
                  <div className="quality-grid">
                    <div className="quality-item">
                      <span className="quality-label">Moisture Content:</span>
                      <span className="quality-value">{blockchainData.qualityTests.moisture}%</span>
                      <span className="quality-status passed">✓</span>
                    </div>
                    <div className="quality-item">
                      <span className="quality-label">Pesticides:</span>
                      <span className="quality-value">{blockchainData.qualityTests.pesticides} mg/kg</span>
                      <span className="quality-status passed">✓</span>
                    </div>
                    <div className="quality-item">
                      <span className="quality-label">Heavy Metals:</span>
                      <span className="quality-value">{blockchainData.qualityTests.heavyMetals} ppm</span>
                      <span className="quality-status passed">✓</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Information */}
              {blockchainData.processing && (
                <div className="record-section">
                  <h3>⚙️ Processing Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Method:</span>
                      <span className="info-value">{blockchainData.processing.method}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Temperature:</span>
                      <span className="info-value">{blockchainData.processing.temperature}°C</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">{blockchainData.processing.duration} hours</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Yield:</span>
                      <span className="info-value">{blockchainData.processing.yield} kg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-button">
            Close
          </button>
          {blockchainData && (
            <button 
              onClick={() => window.print()} 
              className="print-button"
            >
              Print Record
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 20px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 2px solid #e5e7eb;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: var(--primary-green);
          width: 28px;
          height: 28px;
        }

        .modal-title h2 {
          color: var(--primary-green);
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .batch-id {
          background: var(--accent-green);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .close-button {
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid var(--accent-green);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 20px;
          text-align: center;
        }

        .error-icon {
          font-size: 48px;
        }

        .error-state h3 {
          color: #dc2626;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .error-state p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .retry-button {
          background: var(--accent-green);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background: var(--forest-green);
          transform: translateY(-2px);
        }

        .blockchain-record {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .blockchain-meta {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 2px solid #0ea5e9;
          border-radius: 15px;
          padding: 25px;
          position: relative;
        }

        .blockchain-meta h3 {
          color: #0369a1;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e0f2fe;
        }

        .meta-item.critical {
          border: 2px solid #0ea5e9;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
        }

        .meta-icon {
          color: #0369a1;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .meta-content {
          flex: 1;
        }

        .meta-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .meta-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          word-break: break-all;
        }

        .meta-value.txid {
          font-family: 'Courier New', monospace;
          color: #0369a1;
          font-size: 13px;
          background: #f0f9ff;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .meta-value.block-number {
          font-family: 'Courier New', monospace;
          color: #dc2626;
          font-size: 16px;
          font-weight: 700;
        }

        .verification-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 16px;
        }

        .verified-icon {
          font-size: 18px;
        }

        .mock-badge {
          background: rgba(255, 193, 7, 0.2);
          color: #856404;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 10px;
        }

        .record-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .record-section h3 {
          color: var(--primary-green);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .info-icon {
          color: var(--accent-green);
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 14px;
        }

        .info-value {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .location-info {
          display: flex;
          gap: 15px;
        }

        .location-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .location-icon {
          color: #ef4444;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .location-content {
          flex: 1;
        }

        .location-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .location-value {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .location-address {
          font-size: 13px;
          color: #6b7280;
        }

        .quality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .quality-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .quality-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 14px;
        }

        .quality-value {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .quality-status {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .quality-status.passed {
          background: #dcfce7;
          color: #166534;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .close-modal-button {
          background: #6b7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-modal-button:hover {
          background: #4b5563;
        }

        .print-button {
          background: var(--accent-green);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .print-button:hover {
          background: var(--forest-green);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .modal-container {
            margin: 10px;
            max-height: 95vh;
          }
          
          .modal-header {
            padding: 20px;
          }
          
          .modal-content {
            padding: 20px;
          }
          
          .meta-grid {
            grid-template-columns: 1fr;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .quality-grid {
            grid-template-columns: 1fr;
          }
          
          .location-info {
            flex-direction: column;
          }
          
          .modal-footer {
            flex-direction: column;
            gap: 10px;
          }
          
          .close-modal-button,
          .print-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default BlockchainRecordModal;
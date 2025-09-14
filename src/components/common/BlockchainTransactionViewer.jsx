import React, { useState, useEffect } from 'react';
import { Database, Hash, Clock, MapPin, User, Package, Eye, Download, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

function BlockchainTransactionViewer({ batchId, onClose }) {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSteps, setAvailableSteps] = useState([]);

  useEffect(() => {
    if (batchId) {
      fetchRealTransactionData();
    }
  }, [batchId]);

  const fetchRealTransactionData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/blockchain/real-transactions/${batchId}`);
      
      if (response.ok) {
        const result = await response.json();
        setTransactionData(result.data);
        setAvailableSteps(result.completedSteps || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch transaction data');
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError('Network error: Unable to connect to blockchain');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRForNextStep = async (stepType) => {
    try {
      const response = await fetch(`/api/blockchain/qr/download-for-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchId, stepType })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${batchId}-${stepType}-qr.png`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('QR download failed:', response.status);
        alert('Failed to download QR code');
      }
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Error downloading QR code');
    }
  };

  const getStepStatus = (stepType) => {
    return availableSteps.includes(stepType) ? 'completed' : 'pending';
  };

  const getNextStep = () => {
    const allSteps = ['collection', 'quality', 'processing', 'manufacturing'];
    return allSteps.find(step => !availableSteps.includes(step));
  };

  if (loading) {
    return (
      <div className="transaction-viewer">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching real blockchain transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-viewer">
        <div className="error-state">
          <AlertCircle size={24} />
          <h3>Transaction Not Found</h3>
          <p>{error}</p>
          <button onClick={fetchRealTransactionData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return null;
  }

  const nextStep = getNextStep();

  return (
    <div className="transaction-viewer">
      <div className="viewer-header">
        <div className="batch-info">
          <Database className="batch-icon" />
          <div>
            <h2>Batch: {batchId}</h2>
            <p>Real-time Blockchain Status</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-button">
            <Eye size={20} />
          </button>
        )}
      </div>

      <div className="steps-progress">
        <h3>Traceability Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(availableSteps.length / 4) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {availableSteps.length} of 4 steps completed
        </div>
      </div>

      <div className="steps-container">
        {/* Collection Step */}
        <div className={`step-card ${getStepStatus('collection')}`}>
          <div className="step-header">
            <div className="step-icon">🌱</div>
            <div className="step-info">
              <h4>Step 1: Collection</h4>
              <p>Farmer/Collector records herb collection</p>
            </div>
            <div className="step-status">
              {getStepStatus('collection') === 'completed' ? (
                <CheckCircle className="status-icon completed" />
              ) : (
                <AlertCircle className="status-icon pending" />
              )}
            </div>
          </div>
          
          {getStepStatus('collection') === 'completed' && transactionData.collection && (
            <div className="step-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Species:</span>
                  <span className="detail-value">{transactionData.collection.species}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{transactionData.collection.weight}g</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {transactionData.collection.latitude?.toFixed(4)}, {transactionData.collection.longitude?.toFixed(4)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Timestamp:</span>
                  <span className="detail-value">
                    {new Date(transactionData.collection.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {nextStep === 'quality' && (
                <div className="step-actions">
                  <button 
                    onClick={() => downloadQRForNextStep(batchId, 'quality')}
                    className="action-button download"
                  >
                    <Download size={16} />
                    Download QR for Lab Testing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quality Testing Step */}
        <div className={`step-card ${getStepStatus('quality')}`}>
          <div className="step-header">
            <div className="step-icon">🔬</div>
            <div className="step-info">
              <h4>Step 2: Quality Testing</h4>
              <p>Lab technician performs quality attestation</p>
            </div>
            <div className="step-status">
              {getStepStatus('quality') === 'completed' ? (
                <CheckCircle className="status-icon completed" />
              ) : (
                <AlertCircle className="status-icon pending" />
              )}
            </div>
          </div>
          
          {getStepStatus('quality') === 'completed' && transactionData.quality && (
            <div className="step-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Moisture:</span>
                  <span className="detail-value">{transactionData.quality.moisture}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pesticides:</span>
                  <span className="detail-value">{transactionData.quality.pesticides} mg/kg</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Heavy Metals:</span>
                  <span className="detail-value">{transactionData.quality.heavyMetals} ppm</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value ${transactionData.quality.passed ? 'passed' : 'failed'}`}>
                    {transactionData.quality.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
              
              {nextStep === 'processing' && transactionData.quality.passed && (
                <div className="step-actions">
                  <button 
                    onClick={() => downloadQRForNextStep(batchId, 'processing')}
                    className="action-button download"
                  >
                    <Download size={16} />
                    Download QR for Processing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Processing Step */}
        <div className={`step-card ${getStepStatus('processing')}`}>
          <div className="step-header">
            <div className="step-icon">⚙️</div>
            <div className="step-info">
              <h4>Step 3: Processing</h4>
              <p>Processor handles herb processing</p>
            </div>
            <div className="step-status">
              {getStepStatus('processing') === 'completed' ? (
                <CheckCircle className="status-icon completed" />
              ) : (
                <AlertCircle className="status-icon pending" />
              )}
            </div>
          </div>
          
          {getStepStatus('processing') === 'completed' && transactionData.processing && (
            <div className="step-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">{transactionData.processing.method}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Temperature:</span>
                  <span className="detail-value">{transactionData.processing.temperature}°C</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Yield:</span>
                  <span className="detail-value">{transactionData.processing.yield}g</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{transactionData.processing.duration} hours</span>
                </div>
              </div>
              
              {nextStep === 'manufacturing' && (
                <div className="step-actions">
                  <button 
                    onClick={() => downloadQRForNextStep(batchId, 'manufacturing')}
                    className="action-button download"
                  >
                    <Download size={16} />
                    Download QR for Manufacturing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manufacturing Step */}
        <div className={`step-card ${getStepStatus('manufacturing')}`}>
          <div className="step-header">
            <div className="step-icon">🏭</div>
            <div className="step-info">
              <h4>Step 4: Manufacturing</h4>
              <p>Manufacturer creates final product</p>
            </div>
            <div className="step-status">
              {getStepStatus('manufacturing') === 'completed' ? (
                <CheckCircle className="status-icon completed" />
              ) : (
                <AlertCircle className="status-icon pending" />
              )}
            </div>
          </div>
          
          {getStepStatus('manufacturing') === 'completed' && transactionData.manufacturing && (
            <div className="step-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{transactionData.manufacturing.productName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Batch Size:</span>
                  <span className="detail-value">{transactionData.manufacturing.batchSize} units</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expiry:</span>
                  <span className="detail-value">
                    {new Date(transactionData.manufacturing.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="step-actions">
                <div className="completion-badge">
                  <CheckCircle size={20} />
                  <span>Batch Complete - Ready for Consumer</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Action */}
      {nextStep && (
        <div className="next-action">
          <h4>Next Required Action:</h4>
          <div className="next-step-info">
            <ArrowRight className="next-icon" />
            <span>Waiting for {nextStep} step to be completed</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .transaction-viewer {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(45, 80, 22, 0.1);
        }

        .batch-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .batch-icon {
          color: var(--primary-green);
          width: 32px;
          height: 32px;
        }

        .batch-info h2 {
          color: var(--primary-green);
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .batch-info p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
          color: var(--primary-green);
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .steps-progress {
          background: rgba(45, 80, 22, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(45, 80, 22, 0.1);
        }

        .steps-progress h3 {
          color: var(--primary-green);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(45, 80, 22, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-green), var(--forest-green));
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          text-align: center;
          color: var(--primary-green);
          font-weight: 600;
          font-size: 14px;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 15px;
          padding: 20px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .step-card.completed {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .step-card.pending {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .step-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-info {
          flex: 1;
        }

        .step-info h4 {
          color: var(--primary-green);
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .step-info p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .status-icon {
          width: 24px;
          height: 24px;
        }

        .status-icon.completed {
          color: #22c55e;
        }

        .status-icon.pending {
          color: #f59e0b;
        }

        .step-details {
          padding-top: 15px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 15px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          font-size: 14px;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: var(--primary-green);
          font-weight: 600;
        }

        .detail-value.passed {
          color: #22c55e;
        }

        .detail-value.failed {
          color: #ef4444;
        }

        .step-actions {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .action-button.download {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .action-button.download:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .completion-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .next-action {
          background: rgba(245, 158, 11, 0.1);
          border: 2px solid #f59e0b;
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          text-align: center;
        }

        .next-action h4 {
          color: #92400e;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .next-step-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #92400e;
          font-weight: 500;
        }

        .next-icon {
          color: #f59e0b;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 60px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(45, 80, 22, 0.1);
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
          gap: 20px;
          padding: 60px;
          text-align: center;
        }

        .error-state h3 {
          color: #dc2626;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .error-state p {
          color: #6b7280;
          margin: 0;
        }

        .retry-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .viewer-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
          
          .step-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default BlockchainTransactionViewer;
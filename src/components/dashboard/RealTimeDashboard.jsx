import React, { useState, useEffect } from 'react';
import { Database, Package, Clock, Eye, Download, RefreshCw, Trash2 } from 'lucide-react';
import BlockchainTransactionViewer from '../common/BlockchainTransactionViewer';

function RealTimeDashboard() {
  const [activeBatches, setActiveBatches] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkHealth, setNetworkHealth] = useState(null);

  useEffect(() => {
    fetchActiveBatches();
    fetchRecentTransactions();
    fetchNetworkHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActiveBatches();
      fetchRecentTransactions();
      fetchNetworkHealth();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveBatches = async () => {
    try {
      const response = await fetch('/api/blockchain/active-batches');
      if (response.ok) {
        const data = await response.json();
        setActiveBatches(data);
      }
    } catch (error) {
      console.error('Error fetching active batches:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/blockchain/transactions?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchNetworkHealth = async () => {
    try {
      const response = await fetch('/api/blockchain/health');
      if (response.ok) {
        const data = await response.json();
        setNetworkHealth(data);
      }
    } catch (error) {
      console.error('Error fetching network health:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchActiveBatches(),
      fetchRecentTransactions(),
      fetchNetworkHealth()
    ]);
    setLoading(false);
  };

  const clearAllTransactions = async () => {
    if (confirm('Are you sure you want to clear all transactions? This will reset the demo data.')) {
      try {
        const response = await fetch('/api/blockchain/clear-transactions', {
          method: 'POST'
        });
        
        if (response.ok) {
          await handleRefresh();
          alert('All transactions cleared and demo data reinitialized');
        }
      } catch (error) {
        console.error('Error clearing transactions:', error);
        alert('Failed to clear transactions');
      }
    }
  };

  const downloadQRForBatch = async (batchId) => {
    try {
      const response = await fetch(`/api/blockchain/qr/download-for-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchId, stepType: 'current' })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${batchId}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('QR download failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to download QR code');
      }
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Error downloading QR code');
    }
  };

  const getStepName = (step) => {
    const stepNames = {
      'collection': 'Collection',
      'quality': 'Quality Testing',
      'processing': 'Processing',
      'manufacturing': 'Manufacturing'
    };
    return stepNames[step] || step;
  };

  const getStepIcon = (step) => {
    const stepIcons = {
      'collection': '🌱',
      'quality': '🔬',
      'processing': '⚙️',
      'manufacturing': '🏭'
    };
    return stepIcons[step] || '📦';
  };

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <Database className="header-icon" />
            <div>
              <h2>Real-Time Blockchain Transactions</h2>
              <p>Live view of all blockchain activities - No mock data</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              className="action-btn refresh"
              disabled={loading}
            >
              <RefreshCw className={`btn-icon ${loading ? 'spinning' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={clearAllTransactions} 
              className="action-btn clear"
            >
              <Trash2 className="btn-icon" />
              Clear All
            </button>
          </div>
        </div>
        
        {networkHealth && (
          <div className="network-status">
            <div className="status-item">
              <span className="status-label">Network:</span>
              <span className={`status-value ${networkHealth.status}`}>
                {networkHealth.status.toUpperCase()}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Active Batches:</span>
              <span className="status-value">{networkHealth.activeBatches}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Total Transactions:</span>
              <span className="status-value">{networkHealth.totalTransactions}</span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <div className="content-grid">
          {/* Active Batches */}
          <div className="section-card">
            <div className="section-header">
              <Package className="section-icon" />
              <h3>Active Batches</h3>
              <span className="batch-count">{activeBatches.length}</span>
            </div>
            
            <div className="batches-list">
              {activeBatches.length === 0 ? (
                <div className="empty-state">
                  <Package size={32} />
                  <p>No active batches found</p>
                </div>
              ) : (
                activeBatches.map(batch => (
                  <div key={batch.batchId} className="batch-item">
                    <div className="batch-header">
                      <div className="batch-id">{batch.batchId}</div>
                      <div className="batch-species">{batch.species}</div>
                    </div>
                    
                    <div className="batch-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(batch.completedSteps / 4) * 100}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {batch.completedSteps}/4 steps completed
                      </div>
                    </div>
                    
                    <div className="batch-current-step">
                      <span className="current-step-icon">
                        {getStepIcon(batch.currentStep)}
                      </span>
                      <span className="current-step-text">
                        Current: {getStepName(batch.currentStep)}
                      </span>
                    </div>
                    
                    <div className="batch-actions">
                      <button 
                        onClick={() => setSelectedBatch(batch.batchId)}
                        className="view-button"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        onClick={() => downloadQRForBatch(batch.batchId)}
                        className="download-button"
                      >
                        <Download size={16} />
                        Download QR
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="section-card">
            <div className="section-header">
              <Clock className="section-icon" />
              <h3>Recent Transactions</h3>
              <span className="transaction-count">{recentTransactions.length}</span>
            </div>
            
            <div className="transactions-list">
              {recentTransactions.length === 0 ? (
                <div className="empty-state">
                  <Clock size={32} />
                  <p>No transactions recorded yet</p>
                </div>
              ) : (
                recentTransactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-header">
                      <div className="transaction-function">{tx.function}</div>
                      <div className="transaction-time">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="detail-row">
                        <span className="detail-label">Batch ID:</span>
                        <span className="detail-value">{tx.batchId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Transaction ID:</span>
                        <span className="detail-value tx-id">{tx.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Block:</span>
                        <span className="detail-value">{tx.blockNumber}</span>
                      </div>
                    </div>
                    
                    <div className="transaction-status">
                      <span className="status-badge success">
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Viewer Modal */}
      {selectedBatch && (
        <div className="modal-overlay">
          <div className="modal-container">
            <BlockchainTransactionViewer 
              batchId={selectedBatch}
              onClose={() => setSelectedBatch(null)}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .realtime-dashboard {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-icon {
          color: var(--primary-green);
          width: 32px;
          height: 32px;
        }

        .header-info h2 {
          color: var(--primary-green);
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .header-info p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .action-btn.refresh {
          background: rgba(34, 197, 94, 0.2);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .action-btn.refresh:hover {
          background: rgba(34, 197, 94, 0.3);
          transform: translateY(-2px);
        }

        .action-btn.clear {
          background: rgba(239, 68, 68, 0.2);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .action-btn.clear:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: translateY(-2px);
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .network-status {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 15px;
          background: rgba(45, 80, 22, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(45, 80, 22, 0.1);
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-label {
          color: #6b7280;
          font-weight: 500;
          font-size: 14px;
        }

        .status-value {
          color: var(--primary-green);
          font-weight: 700;
          font-size: 14px;
        }

        .status-value.connected {
          color: #22c55e;
        }

        .status-value.mock {
          color: #f59e0b;
        }

        .dashboard-content {
          margin-bottom: 30px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 25px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(45, 80, 22, 0.1);
        }

        .section-icon {
          color: var(--primary-green);
          width: 24px;
          height: 24px;
        }

        .section-header h3 {
          color: var(--primary-green);
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .batch-count,
        .transaction-count {
          background: var(--accent-green);
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
        }

        .batches-list,
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 500px;
          overflow-y: auto;
        }

        .batch-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .batch-item:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .batch-id {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: var(--primary-green);
          font-size: 16px;
        }

        .batch-species {
          color: #6b7280;
          font-weight: 500;
          font-size: 14px;
        }

        .batch-progress {
          margin-bottom: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(45, 80, 22, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-green), var(--forest-green));
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .batch-current-step {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .current-step-icon {
          font-size: 16px;
        }

        .current-step-text {
          color: var(--primary-green);
          font-weight: 600;
          font-size: 14px;
        }

        .batch-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .view-button,
        .download-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .view-button {
          background: rgba(59, 130, 246, 0.2);
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .view-button:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .download-button {
          background: rgba(34, 197, 94, 0.2);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .download-button:hover {
          background: rgba(34, 197, 94, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }
        .transaction-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .transaction-function {
          color: var(--primary-green);
          font-weight: 600;
          font-size: 14px;
        }

        .transaction-time {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
        }

        .transaction-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #374151;
          font-weight: 600;
        }

        .detail-value.tx-id {
          font-family: 'Courier New', monospace;
          font-size: 11px;
        }

        .transaction-status {
          display: flex;
          justify-content: flex-end;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.success {
          background: rgba(34, 197, 94, 0.2);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          color: #6b7280;
          text-align: center;
        }

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
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: center;
          }
          
          .network-status {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default RealTimeDashboard;
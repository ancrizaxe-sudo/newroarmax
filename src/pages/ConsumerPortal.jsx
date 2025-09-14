import React, { useState } from 'react';
import QRScanner from '../components/common/QRScanner';
import BlockchainVerification from '../components/common/BlockchainVerification';
import { Package, MapPin, Award, Clock } from 'lucide-react';
import './ConsumerPortal.css';

function ConsumerPortal() {
  const [scannedData, setScannedData] = useState(null);
  const [provenanceData, setProvenanceData] = useState(null);

  const handleQRScan = async (data) => {
    // The QR data is just the batch ID (e.g., "HERB12345")
    console.log('Consumer scanned batch ID:', data);
    setScannedData({ batchId: data });
  };

  const handleBlockchainVerification = (blockchainData) => {
    // Set the complete provenance data from blockchain
    setProvenanceData(blockchainData);
  };

  const renderJourneyMap = () => {
    if (!provenanceData || !provenanceData.journey) return null;

    // Mock map display for demo
    return (
      <div style={{ 
        height: '400px', 
        width: '100%', 
        background: '#e8f5e8', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        border: '2px solid #4CAF50'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
            Journey Map
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {provenanceData.journey.length} locations tracked
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineStep = (step, index) => (
    <div key={index} className="timeline-step">
      <div className="timeline-marker">
        <div className="timeline-icon">{step.icon}</div>
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <h4>{step.stage}</h4>
          <span className="timeline-date">
            {new Date(step.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="timeline-details">
          <p><strong>Organization:</strong> {step.organization}</p>
          <p><strong>Location:</strong> {step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}</p>
          {step.details && (
            <div className="step-details">
              {Object.entries(step.details).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
          )}
          {step.imageHash && (
            <div className="step-image">
              <img 
                src={`https://ipfs.io/ipfs/${step.imageHash}`} 
                alt={`${step.stage} verification`}
                className="verification-image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="consumer-portal">
      <div className="container">
        <div className="portal-header">
          <h1>Product Verification Portal</h1>
          <p>Scan the QR code on your Ayurvedic product to trace its complete journey from farm to shelf</p>
        </div>

        {!provenanceData ? (
          <div className="scanner-section">
            <div className="card">
              <h2>Scan Product QR Code</h2>
              <QRScanner onScan={handleQRScan} />
              
              {scannedData && (
                <BlockchainVerification 
                  batchId={scannedData.batchId}
                  onVerificationComplete={handleBlockchainVerification}
                />
              )}
              
              <div className="scan-instructions">
                <h4>📱 How to Use:</h4>
                <ul>
                  <li>Click "Scan with Camera" to use your device camera</li>
                  <li>Or click "Upload QR Image" to select a QR code image</li>
                  <li>Results will appear automatically - no additional input needed!</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="provenance-display fade-in">
            <div className="product-header">
              <div className="card">
                <div className="product-info">
                  <h2>{provenanceData.productName}</h2>
                  <div className="product-details">
                    <div className="detail-item">
                      <Package size={16} />
                      <strong>Batch ID:</strong> {provenanceData.batchId}
                    </div>
                    <div className="detail-item">
                      <Award size={16} />
                      <strong>Species:</strong> {provenanceData.herbName}
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <strong>Collection Date:</strong> {new Date(provenanceData.timestamp).toLocaleDateString()}
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <strong>Origin:</strong> {provenanceData.location?.address || 'India'}
                    </div>
                  </div>
                  
                  <div className="authenticity-badge">
                    <span className="verified-badge">✅ VERIFIED AUTHENTIC</span>
                  </div>
                </div>
                
                {provenanceData.manufacturing?.productImage && (
                  <div className="product-image">
                    <img 
                      src={`https://ipfs.io/ipfs/${provenanceData.manufacturing.productImage}`} 
                      alt="Product"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3>Journey Map</h3>
                <div className="map-container">
                  {renderJourneyMap()}
                </div>
              </div>

              <div className="card">
                <h3>Quality Certifications</h3>
                <div className="certifications">
                  <div className="cert-item">
                    <span className="cert-badge cert-gmp">GMP Certified</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-gacp">GACP Compliant</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-ayush">AYUSH Approved</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-organic">Organic Certified</span>
                  </div>
                </div>

                <div className="quality-metrics">
                  <h4>Quality Test Results</h4>
                  {provenanceData.qualityTests && (
                    <div className="metrics-grid">
                      <div className="metric">
                        <span className="metric-label">Moisture</span>
                        <span className="metric-value">{provenanceData.qualityTests.moisture}%</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Pesticides</span>
                        <span className="metric-value">{provenanceData.qualityTests.pesticides} mg/kg</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Heavy Metals</span>
                        <span className="metric-value">{provenanceData.qualityTests.heavyMetals} ppm</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Complete Traceability Timeline</h3>
              <div className="timeline">
                {/* Collection Step */}
                <div className="timeline-step">
                  <div className="timeline-marker">
                    <div className="timeline-icon">🌱</div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>Collection</h4>
                      <span className="timeline-date">
                        {new Date(provenanceData.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="timeline-details">
                      <p><strong>Farmer:</strong> {provenanceData.farmerID}</p>
                      <p><strong>Location:</strong> {provenanceData.location?.latitude?.toFixed(4)}, {provenanceData.location?.longitude?.toFixed(4)}</p>
                      <p><strong>Herb:</strong> {provenanceData.herbName}</p>
                    </div>
                  </div>
                </div>

                {/* Quality Testing Step */}
                {provenanceData.qualityTests && (
                  <div className="timeline-step">
                    <div className="timeline-marker">
                      <div className="timeline-icon">🔬</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>Quality Testing</h4>
                        <span className="timeline-date">Lab Verified</span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>Status:</strong> PASSED</p>
                        <p><strong>Moisture:</strong> {provenanceData.qualityTests.moisture}%</p>
                        <p><strong>Pesticides:</strong> {provenanceData.qualityTests.pesticides} mg/kg</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Step */}
                {provenanceData.processing && (
                  <div className="timeline-step">
                    <div className="timeline-marker">
                      <div className="timeline-icon">⚙️</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>Processing</h4>
                        <span className="timeline-date">Processed</span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>Method:</strong> {provenanceData.processing.method}</p>
                        <p><strong>Temperature:</strong> {provenanceData.processing.temperature}°C</p>
                        <p><strong>Yield:</strong> {provenanceData.processing.yield} kg</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manufacturing Step */}
                {provenanceData.manufacturing && (
                  <div className="timeline-step">
                    <div className="timeline-marker">
                      <div className="timeline-icon">🏭</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>Manufacturing</h4>
                        <span className="timeline-date">
                          {new Date(provenanceData.manufacturing.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>Product:</strong> {provenanceData.manufacturing.productName}</p>
                        <p><strong>Batch Size:</strong> {provenanceData.manufacturing.batchSize} units</p>
                        <p><strong>Expiry:</strong> {new Date(provenanceData.manufacturing.expiryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Blockchain Verification Summary</h3>
              <div className="verification-summary">
                <div className="summary-item">
                  <strong>✅ Verified on Blockchain:</strong> All steps recorded immutably
                </div>
                <div className="summary-item">
                  <strong>🔗 Transaction ID:</strong> {provenanceData.blockchain?.transactionId || 'Available in raw data'}
                </div>
                <div className="summary-item">
                  <strong>📦 Block Number:</strong> {provenanceData.blockchain?.blockNumber || 'Available in raw data'}
                </div>
                <div className="summary-item">
                  <strong>🌐 Network:</strong> Hyperledger Fabric (herbionyx-network)
                </div>
              </div>
            </div>

            <div className="portal-actions">
              <button 
                className="button secondary"
                onClick={() => {
                  setProvenanceData(null);
                  setScannedData(null);
                }}
              >
                Scan Another Product
              </button>
              
              <button 
                className="button"
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsumerPortal;
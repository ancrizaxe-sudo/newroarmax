import React, { useRef, useState } from 'react';
import { Camera, Upload, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import jsQR from 'jsqr';

function QRScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        setPreview(e.target.result);
        
        // Create image element to process QR
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (qrCode) {
            // Extract only the text/ID from QR code
            const qrText = qrCode.data.trim();
            console.log('QR Code detected:', qrText);
            
            // Validate that it's a batch ID format (e.g., HERB12345, BATCH_123, etc.)
            if (qrText.match(/^(HERB|BATCH|EVT|TEST|PROC)[\w_]+$/i)) {
              setScannedResult(qrText);
              onScan(qrText);
            } else {
              setError('Invalid QR format. Expected batch ID format (e.g., HERB12345)');
            }
          } else {
            setError('No QR code detected in image');
          }
          setLoading(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('QR processing error:', error);
      setError('Failed to process QR code from image');
      setLoading(false);
    }
  };

  const startCameraScan = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning loop
        const scanLoop = () => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const video = videoRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode) {
              const qrText = qrCode.data.trim();
              console.log('Camera QR detected:', qrText);
              
              if (qrText.match(/^(HERB|BATCH|EVT|TEST|PROC)[\w_]+$/i)) {
                setScannedResult(qrText);
                onScan(qrText);
                stopCamera();
                return;
              }
            }
            
            if (isScanning) {
              requestAnimationFrame(scanLoop);
            }
          }
        };
        
        // Wait for video to be ready
        video.addEventListener('loadedmetadata', () => {
          scanLoop();
        });
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const clearResults = () => {
    setPreview(null);
    setScannedResult(null);
    setError('');
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-controls">
        <button 
          onClick={startCameraScan} 
          className="scanner-btn camera-btn"
          disabled={isScanning || loading}
        >
          <Camera size={20} />
          {isScanning ? 'Scanning...' : 'Scan with Camera'}
        </button>
        
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="scanner-btn upload-btn"
          disabled={loading}
        >
          <Upload size={20} />
          Upload QR Image
        </button>

        {(preview || scannedResult || isScanning) && (
          <button onClick={clearResults} className="scanner-btn clear-btn">
            Clear
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Camera Video */}
      {isScanning && (
        <div className="camera-container">
          <video ref={videoRef} className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="scanning-overlay">
            <div className="scan-frame">
              <div className="scan-corners"></div>
              <p>Position QR code within frame</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Processing QR code...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="qr-preview">
          <h4><Eye size={16} /> Image Preview</h4>
          <img src={preview} alt="QR Code Preview" className="preview-image" />
        </div>
      )}

      {/* Results Display */}
      {scannedResult && (
        <div className="scan-results">
          <div className="result-header">
            <CheckCircle size={20} />
            <h4>QR Code Detected</h4>
          </div>
          <div className="result-content">
            <div className="batch-id">
              <strong>Batch ID:</strong> {scannedResult}
            </div>
            <p>Verifying with blockchain...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .qr-scanner {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .scanner-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .scanner-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 140px;
        }

        .camera-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .camera-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-2px);
        }

        .camera-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .upload-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #10b981);
          transform: translateY(-2px);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .clear-btn {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .clear-btn:hover {
          background: #e5e7eb;
        }

        .camera-container {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .camera-video {
          width: 100%;
          height: auto;
          display: block;
        }

        .scanning-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }

        .scan-frame {
          width: 250px;
          height: 250px;
          border: 3px solid #3b82f6;
          border-radius: 12px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scan-frame p {
          color: white;
          font-weight: 600;
          text-align: center;
          margin: 0;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 12px;
          border-radius: 6px;
        }

        .scan-corners::before,
        .scan-corners::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #3b82f6;
        }

        .scan-corners::before {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
        }

        .scan-corners::after {
          bottom: -3px;
          right: -3px;
          border-left: none;
          border-top: none;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 30px;
          background: #f0f9ff;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-display {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          color: #dc2626;
          margin-bottom: 20px;
        }

        .qr-preview {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .qr-preview h4 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #374151;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .scan-results {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .result-header h4 {
          color: #166534;
          margin: 0;
          font-size: 16px;
        }

        .result-content {
          color: #166534;
        }

        .batch-id {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.5);
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .scanner-controls {
            flex-direction: column;
          }
          
          .scanner-btn {
            min-width: auto;
          }
          
          .scan-frame {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

export default QRScanner;
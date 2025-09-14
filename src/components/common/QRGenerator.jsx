import React, { useEffect, useRef, useState } from 'react';
import { Download, Printer, Copy, Eye } from 'lucide-react';

function QRGenerator({ data, size = 256, batchId, qrType = 'unknown' }) {
  const canvasRef = useRef(null);
  const [qrImage, setQrImage] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (data) {
      generateRealQR();
    }
  }, [data, batchId]);

  const generateRealQR = async () => {
    try {
      // Generate QR code containing only the batch ID
      const qrContent = batchId || data;
      
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: qrContent,
          options: {
            width: size,
            margin: 2,
            color: {
              dark: '#2d5016',
              light: '#FFFFFF'
            }
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setQrImage(result.qrCodeUrl);
      } else {
        console.error('QR generation failed');
      }
    } catch (error) {
      console.error('QR generation error:', error);
    }
  };

  const downloadQR = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.download = `herbionyx-qr-${Date.now()}.png`;
      link.href = qrImage;
      link.click();
    }
  };

  const printQR = () => {
    if (qrImage) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>HERBIONYX QR Code</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container { 
                display: inline-block; 
                padding: 20px; 
                border: 2px solid #000; 
                margin: 20px; 
              }
              .qr-title { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 10px; 
              }
              .qr-subtitle { 
                font-size: 12px; 
                color: #666; 
                margin-bottom: 15px; 
              }
              .qr-image { 
                display: block; 
                margin: 0 auto; 
              }
              .qr-footer { 
                font-size: 10px; 
                color: #999; 
                margin-top: 15px; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">HERBIONYX</div>
              <div class="qr-subtitle">Ayurvedic Herbs Traceability</div>
              <img src="${qrImage}" class="qr-image" />
              <div class="qr-footer">Generated: ${new Date().toLocaleString()}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyToClipboard = async () => {
    if (data) {
      try {
        await navigator.clipboard.writeText(typeof data === 'string' ? data : JSON.stringify(data));
        alert('QR data copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy QR data');
      }
    }
  };

  if (!data) {
    return (
      <div className="qr-placeholder">
        <div className="placeholder-icon">📱</div>
        <p>QR code will be generated automatically</p>
      </div>
    );
  }

  return (
    <div className="qr-generator">
      <div className="qr-header">
        <h3>Generated QR Code</h3>
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="preview-toggle"
        >
          <Eye size={16} />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      {showPreview && (
        <div className="qr-display">
          <div className="qr-container">
            {qrImage ? (
              <img 
                src={qrImage} 
                alt="QR Code"
                className="qr-image"
                style={{ width: size, height: size }}
              />
            ) : (
              <div className="qr-placeholder" style={{ width: size, height: size }}>
                <span>Generating QR...</span>
              </div>
            )}
          </div>
          
          <div className="qr-info">
            <div className="data-preview">
              <h4>QR Data Preview:</h4>
              <pre>{batchId || data}</pre>
              <div className="qr-info">
                <p><strong>Type:</strong> {qrType}</p>
                <p><strong>Contains:</strong> Batch ID only (for blockchain verification)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="qr-actions">
        <button onClick={downloadQR} className="action-btn download-btn">
          <Download size={16} />
          Download
        </button>
        <button onClick={printQR} className="action-btn print-btn">
          <Printer size={16} />
          Print
        </button>
        <button onClick={copyToClipboard} className="action-btn copy-btn">
          <Copy size={16} />
          Copy Batch ID
        </button>
      </div>

      <div className="qr-instructions">
        <p>✅ QR code generated successfully!</p>
        <p>This QR contains batch ID: <strong>{batchId || data}</strong></p>
        <p>Scan this code to verify with blockchain.</p>
      </div>

      <style jsx>{`
        .qr-generator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }

        .qr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .qr-header h3 {
          color: #2c3e50;
          margin: 0;
          font-size: 18px;
        }

        .preview-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
        }

        .preview-toggle:hover {
          background: #e5e7eb;
        }

        .blockchain-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .blockchain-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-1px);
        }

        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        .qr-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .qr-image {
          display: block;
          border-radius: 8px;
        }
        
        .qr-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          color: #6b7280;
          font-weight: 500;
        }

        .qr-info {
          width: 100%;
          max-width: 400px;
        }

        .data-preview {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
        }

        .data-preview h4 {
          color: #374151;
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .data-preview pre {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
          font-size: 12px;
          color: #374151;
          overflow-x: auto;
          margin: 0;
          white-space: pre-wrap;
        }

        .qr-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .download-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .download-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-2px);
        }

        .print-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .print-btn:hover {
          background: linear-gradient(135deg, #059669, #10b981);
          transform: translateY(-2px);
        }

        .copy-btn {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .copy-btn:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .qr-instructions {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        .qr-instructions p {
          margin: 5px 0;
        }

        .qr-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #6c757d;
          text-align: center;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          border: 2px dashed #ced4da;
          padding: 40px;
        }

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.6;
        }
        
        .qr-info {
          margin-top: 10px;
          padding: 10px;
          background: #f0f9ff;
          border-radius: 6px;
          border: 1px solid #bfdbfe;
        }
        
        .qr-info p {
          margin: 4px 0;
          font-size: 12px;
          color: #1e40af;
        }

        @media (max-width: 768px) {
          .qr-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
          
          .qr-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .action-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default QRGenerator;
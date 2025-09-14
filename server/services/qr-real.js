import QRCode from 'qrcode';

class RealQRService {
  constructor() {
    this.qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#2d5016',
        light: '#FFFFFF'
      },
      width: 256
    };
  }

  async generateQR(batchId, options = {}) {
    try {
      // QR code contains only the batch ID for blockchain verification
      const qrContent = batchId;
      
      const qrOptions = {
        ...this.qrOptions,
        ...options
      };

      // Generate actual QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrContent, qrOptions);
      
      return {
        id: this.generateQRId(),
        qrCodeUrl: qrCodeDataURL,
        data: qrContent,
        timestamp: new Date().toISOString(),
        batchId: batchId
      };
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }

  generateQRId() {
    return 'QR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async parseQR(qrText) {
    try {
      // QR should contain only batch ID (e.g., "HERB12345")
      const batchId = qrText.trim();
      
      // Validate batch ID format
      if (!batchId.match(/^(HERB|BATCH|EVT|TEST|PROC)[\w_]+$/i)) {
        throw new Error('Invalid batch ID format');
      }
      
      return {
        valid: true,
        batchId: batchId
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

export default new RealQRService();
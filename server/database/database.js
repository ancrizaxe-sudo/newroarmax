import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.dbPath = path.join(this.dataDir, 'herbionyx.json');
    this.ensureDataDirectory();
    this.initializeDatabase();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        users: [],
        permittedZones: [
          {
            id: 'zone_1',
            name: 'Rajasthan Zone 1',
            minLat: 26.9124,
            minLng: 75.7873,
            maxLat: 27.2124,
            maxLng: 76.0873,
            maxYield: 500,
            active: true
          },
          {
            id: 'zone_2',
            name: 'Gujarat Zone 1',
            minLat: 23.0225,
            minLng: 72.5714,
            maxLat: 23.3225,
            maxLng: 72.8714,
            maxYield: 400,
            active: true
          },
          {
            id: 'zone_3',
            name: 'Maharashtra Zone 1',
            minLat: 19.0760,
            minLng: 72.8777,
            maxLat: 19.3760,
            maxLng: 73.1777,
            maxYield: 600,
            active: true
          }
        ],
        permittedHerbs: [
          { id: 'herb_1', name: 'Talispatra', scientificName: 'Abies webbiana Lindl', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_2', name: 'Chirmati', scientificName: 'Abrus precatorius Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_3', name: 'Katha', scientificName: 'Acacia catechu (L.f.) Willd', seasonStart: 'December', seasonEnd: 'April', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_4', name: 'Vatsnabh', scientificName: 'Aconitum chasmanthum Stapf', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_5', name: 'Vatsnabh', scientificName: 'Aconitum ferox Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_6', name: 'Atees', scientificName: 'Aconitum heterophyllum Wall. ex Royle', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_7', name: 'Vach', scientificName: 'Acorus calamus Linn.', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_8', name: 'Adusa', scientificName: 'Adhatoda zeylanica Medic.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_9', name: 'Beal', scientificName: 'Aegle marmelos (Linn) Corr.', seasonStart: 'March', seasonEnd: 'June', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_10', name: 'Shirish', scientificName: 'Albizzia lebback Benth.', seasonStart: 'February', seasonEnd: 'May', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_11', name: 'Ghritkumari', scientificName: 'Aloe vera (Linn.) Burn.', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 100, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_12', name: 'Smaller Galanga', scientificName: 'Alpinia calcarata Rosc.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_13', name: 'Greater Galanga', scientificName: 'Alpinia galangal Willd', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_14', name: 'Satvin', scientificName: 'Alstonia scholaris R.Br.', seasonStart: 'November', seasonEnd: 'March', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_15', name: 'Silarasa', scientificName: 'Altingia excelsa Noronha', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_16', name: 'Akarkara', scientificName: 'Anacyclus pyrethrum DC.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_17', name: 'Kalmegh', scientificName: 'Andrographis paniculata (Linn.) Burn', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 55, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_18', name: 'Agar', scientificName: 'Aquilaria agallocha Roxb.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_19', name: 'Artemisia', scientificName: 'Artemisia annua (Linn.)', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_20', name: 'Shatavari', scientificName: 'Asparagus racemosus Willd.', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_21', name: 'Ashwagandha', scientificName: 'Withania somnifera (Linn.) Dunal', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_22', name: 'Turmeric', scientificName: 'Curcuma longa', seasonStart: 'January', seasonEnd: 'April', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 10, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 8, unit: 'ppm' } }, active: true },
          { id: 'herb_23', name: 'Neem', scientificName: 'Azadirachta indica', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 75, qualityStandards: { moisture: { max: 14, unit: '%' }, pesticides: { max: 0.005, unit: 'mg/kg' }, heavyMetals: { max: 12, unit: 'ppm' } }, active: true },
          { id: 'herb_24', name: 'Tulsi', scientificName: 'Ocimum sanctum', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 11, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 9, unit: 'ppm' } }, active: true },
          { id: 'herb_25', name: 'Brahmi', scientificName: 'Bacopa monnieri', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 13, unit: '%' }, pesticides: { max: 0.008, unit: 'mg/kg' }, heavyMetals: { max: 11, unit: 'ppm' } }, active: true }
        ],
        collections: [],
        qualityTests: [],
        processings: [],
        batches: [],
        qrCodes: []
      };
      
      this.saveData(initialData);
    }
  }

  loadData() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Database load error:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }

  // Permitted Zones Management
  getPermittedZones() {
    const data = this.loadData();
    return data ? data.permittedZones.filter(zone => zone.active) : [];
  }

  addPermittedZone(zone) {
    const data = this.loadData();
    if (!data) return false;

    const newZone = {
      id: `zone_${Date.now()}`,
      ...zone,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedZones.push(newZone);
    return this.saveData(data);
  }

  updatePermittedZone(zoneId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex] = {
      ...data.permittedZones[zoneIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedZone(zoneId) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex].active = false;
    data.permittedZones[zoneIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // Permitted Herbs Management
  getPermittedHerbs() {
    const data = this.loadData();
    return data ? data.permittedHerbs.filter(herb => herb.active) : [];
  }

  addPermittedHerb(herb) {
    const data = this.loadData();
    if (!data) return false;

    const newHerb = {
      id: `herb_${Date.now()}`,
      ...herb,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedHerbs.push(newHerb);
    return this.saveData(data);
  }

  updatePermittedHerb(herbId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex] = {
      ...data.permittedHerbs[herbIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedHerb(herbId) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex].active = false;
    data.permittedHerbs[herbIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // QR Code Chain Management
  saveQRCode(qrData) {
    const data = this.loadData();
    if (!data) return false;

    data.qrCodes.push({
      id: qrData.id,
      data: qrData,
      createdAt: new Date().toISOString()
    });

    return this.saveData(data);
  }

  getQRChain(qrId) {
    const data = this.loadData();
    if (!data) return null;

    return data.qrCodes.find(qr => qr.id === qrId);
  }
}

export default new Database();
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const AlumniUser = require('../src/models/AlumniUser').default;
const AmbassadorUser = require('../src/models/AmbassadorUser').default;
const AdminUser = require('../src/models/AdminUser').default;
const Broadcast = require('../src/models/Broadcast').default;
const ContactMessage = require('../src/models/ContactMessage').default;
const ReunionRegistration = require('../src/models/ReunionRegistration').default;
const BoardMember = require('../src/models/BoardMember').default;
const GalleryImage = require('../src/models/GalleryImage').default;
const SupportTicket = require('../src/models/SupportTicket').default;

const MODEL_MAP = {
  'alumni': AlumniUser,
  'ambassadors': AmbassadorUser,
  'admins': AdminUser,
  'broadcasts': Broadcast,
  'messages': ContactMessage,
  'reunions': ReunionRegistration,
  'board-members': BoardMember,
  'gallery': GalleryImage,
  'support-tickets': SupportTicket
};

async function restore(backupFolder) {
  try {
    const backupPath = path.join(__dirname, '..', 'backups', backupFolder);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup folder not found: ${backupPath}`);
      process.exit(1);
    }

    console.log(`🔄 Restoring from: ${backupPath}\n`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const files = fs.readdirSync(backupPath).filter(f => f.endsWith('.json') && f !== 'summary.json');

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const model = MODEL_MAP[collectionName];
      
      if (!model) {
        console.warn(`⚠️  No model found for: ${collectionName}`);
        continue;
      }

      const filePath = path.join(backupPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Clear existing data (optional - comment out to merge instead)
      await model.deleteMany({});
      
      if (data.length > 0) {
        await model.insertMany(data);
        console.log(`✅ Restored ${data.length} records to ${collectionName}`);
      }
    }

    console.log('\n🎉 Restore completed!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
}

const backupFolder = process.argv[2];
if (!backupFolder) {
  console.error('Usage: node scripts/restore.js <backup-folder-name>');
  console.error('Example: node scripts/restore.js backup-2026-07-10T14-30-00-000Z');
  process.exit(1);
}

restore(backupFolder);
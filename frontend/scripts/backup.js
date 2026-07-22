// scripts/backup.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function backup() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(); // Automatically gets your database name from the URI
    const collections = await db.listCollections().toArray();
    
    // Create backup folder with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);
    
    // Ensure backups directory exists
    const mainBackupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(mainBackupDir)) {
      fs.mkdirSync(mainBackupDir);
    }
    fs.mkdirSync(backupPath);

    console.log(`📁 Backup directory: ${backupPath}\n`);

    let totalRecords = 0;

    for (const collection of collections) {
      const collName = collection.name;
      // Skip internal MongoDB collections
      if (collName.startsWith('system.')) continue;

      console.log(`⬇️  Exporting ${collName}...`);
      const data = await db.collection(collName).find({}).toArray();
      
      // Convert ObjectIds to strings for clean JSON
      const cleanedData = data.map(doc => {
        const obj = { ...doc };
        if (obj._id) obj._id = obj._id.toString();
        return obj;
      });

      fs.writeFileSync(
        path.join(backupPath, `${collName}.json`),
        JSON.stringify(cleanedData, null, 2)
      );
      console.log(`   ✅ ${cleanedData.length} records saved.`);
      totalRecords += cleanedData.length;
    }

    // Backup .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, path.join(backupPath, 'env.local.backup'));
      console.log('✅ Environment variables backed up');
    }

    console.log(`\n🎉 Backup completed! Total records: ${totalRecords}`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await client.close();
  }
}

backup();
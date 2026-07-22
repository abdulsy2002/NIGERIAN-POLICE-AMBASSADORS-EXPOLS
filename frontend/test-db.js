require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  console.log('Connection String:', process.env.MONGODB_URI?.substring(0, 50) + '...');
  console.log('');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI, {});

  try {
    console.log('🔄 Connecting...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n📊 Available databases:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📋 Collections in ${db.databaseName}:`);
    if (collections.length === 0) {
      console.log('   (No collections yet)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    console.log('\n🎉 Connection test PASSED!');
  } catch (error) {
    console.error('\n❌ Connection FAILED!');
    console.error('Error:', error.message);
    console.error('\n💡 Possible fixes:');
    console.error('   1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('   2. Verify username/password in MONGODB_URI');
    console.error('   3. Check if cluster is running in Atlas');
    console.error('   4. Try using Google DNS (8.8.8.8)');
  } finally {
    await client.close();
  }
}

testConnection();
import mongoose from 'mongoose';

export async function connectToDatabase(uri: string) {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
    console.log('🔌 Connected to MongoDB successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

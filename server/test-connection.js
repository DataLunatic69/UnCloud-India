import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const testMongoConnection = async () => {
  try {
    console.log('🧪 Testing MongoDB connection...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('\n💡 Please update your .env file with your MongoDB connection string');
      process.exit(1);
    }
    
    // Hide credentials in logs
    const displayUri = mongoUri.includes('@') 
      ? mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
      : mongoUri;
      
    console.log(`Connecting to: ${displayUri}`);
    
    if (mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
      console.error('❌ Please replace <username> and <password> in MONGODB_URI with your actual credentials');
      console.log('\n💡 MongoDB Atlas Setup:');
      console.log('   1. Go to https://www.mongodb.com/atlas');
      console.log('   2. Create a free cluster');
      console.log('   3. Create a database user');
      console.log('   4. Get your connection string');
      console.log('   5. Replace the MONGODB_URI in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    console.log('\n💡 Troubleshooting tips:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   1. If using local MongoDB, make sure it\'s running');
      console.log('   2. For MongoDB Atlas, check your connection string');
    } else if (error.message.includes('authentication failed')) {
      console.log('   1. Check your username and password in the connection string');
      console.log('   2. Ensure the database user has proper permissions');
    } else if (error.message.includes('Network')) {
      console.log('   1. Check your internet connection');
      console.log('   2. Verify your IP is whitelisted in MongoDB Atlas');
    } else {
      console.log('   1. Verify your MONGODB_URI format');
      console.log('   2. Check MongoDB Atlas cluster status');
    }
    
    process.exit(1);
  }
};

testMongoConnection();
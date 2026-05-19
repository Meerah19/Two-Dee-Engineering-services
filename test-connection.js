const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/\/\/(.*)@/, '//****:****@'));
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully!');
        
        // Test database operations
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(`📁 Available collections: ${collections.length}`);
        
        await mongoose.disconnect();
        console.log('✅ Connection closed');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
};

testConnection();
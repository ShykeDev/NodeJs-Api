const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Kết nối đến MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booksapi', {
            // Các options mới cho Mongoose 8.x
            serverSelectionTimeoutMS: 5000, // Timeout sau 5s nếu không thể kết nối
            socketTimeoutMS: 45000, // Đóng socket sau 45s nếu không hoạt động
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0 // Disable mongoose buffering
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Log database name
        console.log(`📚 Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Xử lý các events của mongoose
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🔐 MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database disconnection:', error);
        process.exit(1);
    }
});

module.exports = connectDB;

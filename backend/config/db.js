const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers([
  "8.8.8.8","1.1.1.1"
    ]);


const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("MONGO_URI is not set. Please add it to your .env file.");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

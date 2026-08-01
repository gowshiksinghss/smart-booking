const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('⚠️ MONGODB CONNECTION ERROR: Check MONGODB_URI in server/.env or Atlas Network Access IP Whitelist.', error.message);
    // Do not exit; server will continue running and API routes can return 500 errors.
  }
};

module.exports = connectDB;

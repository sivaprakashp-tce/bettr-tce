const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  bucket = new GridFSBucket(conn.connection.db, { bucketName: 'uploads' });
  return conn;
}

function getBucket() {
  if (!bucket) throw new Error('GridFSBucket not initialized');
  return bucket;
}

module.exports = { connectDB, getBucket };

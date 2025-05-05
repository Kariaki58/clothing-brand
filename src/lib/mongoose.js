import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to the .env.local file');
}

let cached = globalThis.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
    try {
        if (cached.conn) return cached.conn;

        if (!cached.promise) {
            cached.promise = mongoose
                .connect(MONGODB_URI, {
                    serverSelectionTimeoutMS: 100000,
                })
                .then((mongoose) => mongoose)
                .catch((err) => {
                    cached.promise = null;
                    throw err;
                });
        }
    
        cached.conn = await cached.promise;
    } catch (err) {
        cached.conn = null;
        throw err;
    }

    globalThis.mongoose = cached;
    return cached.conn;
}
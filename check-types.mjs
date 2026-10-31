import mongoose from 'mongoose';
import config from './src/config/config.js';

await mongoose.connect(config.mongoUri);
const db = mongoose.connection.db;

const services = await db.collection('services').find({}).limit(3).toArray();
console.log('SERVICES:');
for (const s of services) {
    console.log(`  _id=${s._id} -> BSON type ${s._id?._bsontype ?? typeof s._id}`);
}

const bookings = await db.collection('bookings').find({}).limit(3).toArray();
console.log('BOOKINGS:', bookings.length);
for (const b of bookings) {
    console.log(`  _id BSON type ${b._id?._bsontype ?? typeof b._id}`);
    for (const item of b.services ?? []) {
        console.log(`    service=${item.service} -> BSON type ${item.service?._bsontype ?? typeof item.service}`);
    }
}

await mongoose.disconnect();

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(currentDir, '../data');

const config = {
    port: process.env.PORT || 8080,
    data: {
        services: path.join(dataDir, 'services.json'),
        bookings: path.join(dataDir, 'bookings.json')
    }
}

export default config

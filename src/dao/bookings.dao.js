import fs from 'fs/promises';
import config from '../config/config.js';

// DAO de reservas: única capa que conoce el medio de persistencia (archivo JSON).
// No contiene reglas de negocio ni validaciones del dominio.
class BookingsDao {
    constructor(filePath = config.data.bookings) {
        this.filePath = filePath;
    }

    async readAll() {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data); // json -> objeto
    }

    async writeAll(records) {
        await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    }
}

export default BookingsDao;

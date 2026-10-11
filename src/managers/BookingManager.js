import cryto from 'crypto';
import fs from 'fs/promises';

class BookingManager {
    constructor(path) {
        this.path = path;
    }

    async #readBookings() {
            const data = await fs.readFile(this.path, 'utf-8');
                return JSON.parse(data) //json -> objeto
        }
    
        
        async #writeBookings(bookings) {
            await fs.writeFile(this.path, JSON.stringify(bookings, null, 2), 'utf-8');
        }
    
        //GET
        // filters: { category, available } (vienen de req.query, así que son strings)
        async getBookings({ category, available } = {}) {
            let result = await this.#readBookings();
     
            if (category !== undefined) {
                result = result.filter(
                    booking => booking.category.toLowerCase() === String(category).toLowerCase()
                );
            }
            
            if (available !== undefined) {
                result = result.filter(
                    booking => String(booking.available) === String(available).toLowerCase()
                );
            }
            
            return result;
        }
        //GET:ID
        async getBookingById(id) {
            const bookings = await this.#readBookings();
            return bookings.find(booking => String(booking.id) === String(id));
        }
        //POST
        async addBooking({clientName, clientEmail, date, time, status}) {
            const bookings = await this.#readBookings();
            const newBooking = {
                id: cryto.randomUUID(),
                clientName,
                clientEmail,
                date,
                time,
                status,
                services: []
            }
            bookings.push(newBooking);
            await this.#writeBookings(bookings);
            return newBooking;
        }
        //PUT:ID
        async updateBooking(id, data) {
            const bookings = await this.#readBookings();
            const index = bookings.findIndex(booking => String(booking.id) === String(id));
            if (index === -1) return null;
            const booking = {
                ...bookings[index],
                ...data
            };
            bookings[index] = booking;
            await this.#writeBookings(bookings);
            return booking;
        }
        //DELETE:ID
        async deleteBooking(id) {
            const bookings = await this.#readBookings();
            const index = bookings.findIndex(booking => String(booking.id) === String(id));
            if (index === -1) return null;
            const deletedBooking = bookings.splice(index, 1)[0];
            await this.#writeBookings(bookings);
            return deletedBooking;
        }
    }
export default BookingManager;
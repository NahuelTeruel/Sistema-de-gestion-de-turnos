import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

class ViewController {
    static async getServicesView(req, res, next) {
        try {
            const services = await servicesService.getServices();
            res.render('services', { title: 'Servicios', services });
        } catch (error) {
            next(error);
        }
    };

    static async getBookingsView(req, res, next) {
        try {
            const bookings = await bookingsService.getBookingsWithServices();
            res.render('bookings', { title: 'Reservas', bookings });
        } catch (error) {
            next(error);
        }
    };
}

export default ViewController;
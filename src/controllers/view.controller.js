import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

// Arma el link a otra página conservando los filtros y el orden actuales.
const buildPageLink = (req, page) => {
    const params = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
        if (key === 'page' || value === undefined || value === '') return;
        params.set(key, value);
    });

    params.set('page', page);

    return `${req.baseUrl}/services?${params.toString()}`;
};

class ViewController {
    static async getServicesView(req, res, next) {
        try {
            const { docs, ...pagination } = await servicesService.getServices(req.query);

            res.render('services', {
                title: 'Servicios',
                services: docs,
                pagination: {
                    ...pagination,
                    prevLink: pagination.hasPrevPage ? buildPageLink(req, pagination.prevPage) : null,
                    nextLink: pagination.hasNextPage ? buildPageLink(req, pagination.nextPage) : null
                }
            });
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
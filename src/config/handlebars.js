import path from 'path';
import {engine} from 'express-handlebars';

const configureHandlebars = (app, __dirname) => {
    app.engine(
        'handlebars',
        engine({
            defaultLayout: 'main',
            extname: 'handlebars',
            helpers: {
                // Comparación estricta para condicionar badges y clases de estado.
                eq: (a, b) => a === b,
                // Presenta el estado con la primera letra en mayúscula.
                capitalize: (value) => {
                    const text = String(value ?? '');
                    return text.charAt(0).toUpperCase() + text.slice(1);
                }
            }
        })
    )
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, 'views'));
}

export { configureHandlebars };
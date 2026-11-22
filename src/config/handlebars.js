import path from 'path';
import {engine} from 'express-handlebars';

const configureHandlebars = (app, __dirname) => {
    app.engine(
        'handlebars',
        engine({
            defaultLayout: 'main',
            extname: 'handlebars'
        })
    )
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, 'views'));
}

export { configureHandlebars };
/*
 * cPanel-compatible Next.js server entry.
 * - Builds should be run beforehand: npm run build
 * - cPanel should point the Application Startup File to server.js (or use npm start)
 */

require('dotenv').config();
const next = require('next');
const express = require('express');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app
    .prepare()
    .then(() => {
        const server = express();

        // If the app will live behind a reverse proxy (cPanel/Passenger), trust it.
        server.set('trust proxy', true);

        // Let Next.js handle all requests, including assets and middleware.
        server.all('*', (req, res) => handle(req, res));

        server.listen(port, hostname, (err) => {
            if (err) throw err;
            // eslint-disable-next-line no-console
            console.log(`> Server ready on http://${hostname}:${port} (env: ${process.env.NODE_ENV || 'development'})`);
        });
    })
    .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error starting server:', err);
        process.exit(1);
    });



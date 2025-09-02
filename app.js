/*
 * cPanel-compatible Next.js server entry.
 * - Builds should be run beforehand: npm run build
 * - cPanel should point the Application Startup File to app.js (or use npm start)
 */

require('dotenv').config();
const next = require('next');
const express = require('express');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
    .prepare()
    .then(() => {
        const server = express();

        // If the app will live behind a reverse proxy (cPanel/Passenger), trust it.
        server.set('trust proxy', true);

        // Serve static files from the public directory
        server.use(express.static(path.join(__dirname, 'public')));

        // Handle internationalization routes
        server.use((req, res, next) => {
            // If no locale is specified, redirect to default locale (Arabic)
            if (!req.path.match(/^\/(en|fr|ar|kr|po|tur)\//) && req.path !== '/') {
                res.redirect(`/ar${req.path}`);
                return;
            }
            next();
        });

        // Let Next.js handle all other requests
        server.all('*', (req, res) => {
            return handle(req, res);
        });

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

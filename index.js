/**
 * Imports
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const api = require('./lib/api');
const {log4js} = require('./lib/log4js');

/**
 * Crawlers
 */

require('./lib/crawlers');

/**
 * Constants
 */

const PORT = 8080;
const PUBLIC_DIR = 'public';

/**
 * Initialization
 */

const app = express();
const logger = log4js.getLogger('App');

/**
 * Middlewares
 */

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, PUBLIC_DIR)));

/**
 * Endpoints
 */

app.get('/ping', (req, res) => res.json({message: 'pong'}));

app.post('/search', api.search);

const port = process.env.PORT || PORT;
app
    .listen(port, () => {
      logger.info('Server running at:', port);
    })
    .on('error', (error) => {
      if (error) {
        logger.error('Failed to start server...', error.code);
      }
    });

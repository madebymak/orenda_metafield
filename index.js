/**
 * Required External Modules
 */

import express from 'express';
import bodyParser from 'body-parser';
import { updateOrder } from './controllers/helpers.js';

/**
 * App Variables
 */

const app = express();
const PORT = 8000;

/**
 *  App Configuration
 */

/**
 * Routes Definitions
 */

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json();
});

app.post('/', updateOrder);

/**
 * Server Activation
 */

app.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`);
});

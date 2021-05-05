import express from 'express';
import bodyParser from 'body-parser';
import { updateOrder } from './controllers/helpers.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json();
});

app.post('/', updateOrder);

app.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`);
});

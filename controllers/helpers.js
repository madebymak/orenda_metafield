import axios from 'axios';

import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const accessUrl = process.env.shopify_secret;

export const updateOrder = (req, res) => {
	res.json();

	const order = req.body;
	const orderId = order.id;
	const customerId = order.customer.id

	// test ids
	const testCustomerId = 4518786891927;
	const testOrderId = 3182383136919;

	const customerUrl = `${accessUrl}/customers/${testCustomerId}/metafields.json`;
	const orderUrl = `${accessUrl}/orders/${testOrderId}/metafields.json`;

	const data = {
		"metafield": {
			"namespace": "referral_email",
			"key": "email",
			"value": order.email,
			"value_type": "string"
		}
	}

	// add to referal metafield to order
	addMetafield(orderUrl, data)
		.then((res) => {
			res.status == 201 && getMetafields(customerUrl)
				.then((res) => {
					const customerMetafieldList = res.data.metafields;
					let referralExist = false;

					// check if referal email metafield already exists
					referralExist = customerMetafieldList.find(metafield => metafield.namespace == 'referral_email');
					// add referal email to customer metafields
					// return referralExist || addMetafield(customerUrl, data)
					return referralExist ? console.log('skipped') : addMetafield(customerUrl, data);
				});
		});
}

const getMetafields = async (url) => {
	try {
		const resp = await axios.get(url);
		return resp
	} catch (error) {
		console.log({error});
	}
}

const addMetafield = async (url, data) => {
	try {
		const resp = await axios.post(url, data);
		return resp

	} catch (error) {
		console.log({error});
	}
}

import axios from 'axios';
import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const accessUrl = process.env.shopify_secret;
const affiliateUrl = process.env.refersion_affiliate;
const refersion_public = process.env.refersion_public_key;
const refersion_secret = process.env.refersion_secret_key;


export const updateOrder = (req, res) => {
	res.json();

	const order = req.body;
	const orderId = order.id;
	const customerId = order.customer.id
	const orderNote = order.note

	// customer metafields
	let refersionId

	// order metafields
	let orderRefersionType;

	const customerUrl = `${accessUrl}/customers/${customerId}/metafields.json`;
	const orderUrl = `${accessUrl}/orders/${orderId}/metafields.json`;

	if (orderNote) {
		let refersionData;
		const orderNoteSplit = orderNote.split('&');
		refersionId = orderNoteSplit[0].split('=')[1];
		orderRefersionType = orderNoteSplit[1].split('=')[1];

		// get affiliate email
		getAffiliate(refersionId)
			.then((res) => {
				if (res.status == 200) {
					refersionData = res.data
				}
			})
			.then(() => {
				// add order metafields
				addOrderMetafields({ url: orderUrl, data: refersionData, type: orderRefersionType });
			})
			.then(() => {
				// check customer metafields
				getMetafields(customerUrl)
					.then((res) => {
						const customerMetafieldList = res.data.metafields;
						let referralExist = false;

						// check if referal id metafield already exists
						referralExist = customerMetafieldList.find(metafield => metafield.key == 'referrer_id');

						// add referal email to customer metafields if new
						return referralExist ? console.log('skipped') : addCustomerMetafields({ customer_id: customerId, url: customerUrl, data: refersionData });
					})
			})
	}
}

const getMetafields = async (url) => {
	try {
		const resp = await axios.get(url);
		return resp
	} catch (error) {
		console.log({error});
	}
}

const addMetafield = async ({ url, data }) => {
	try {
		const resp = await axios.post(url, data);
		return resp

	} catch (error) {
		console.log({error});
	}
}

const addOrderMetafields = ({ url, data, type }) => {
	const metafieldData = {
		"namespace": "custom_fields",
		"key": "",
		"value": "",
		"value_type": "string"
	}

	const refersionEmail = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_email',
			'value': data.email
		}
	}

	const refersionId = {
		'metafield': {
			...metafieldData,
			'key': 'refersion_id',
			'value': data.id
		}
	}

	const refersionType = {
		'metafield': {
			...metafieldData,
			'key': 'referral_type',
			'value': type
		}
	}

	try {
		const resp = axios.all([
			addMetafield({ url: url, data: refersionEmail }),
			addMetafield({ url: url, data: refersionId }),
			addMetafield({ url: url, data: refersionType })
		])

		return resp
	} catch (error) {
		console.log({error});
	}
}


// add customer metafields
const addCustomerMetafields = ({ customer_id, url, data }) => {
	const metafieldData = {
		"namespace": "custom_fields",
		"key": "",
		"value": "",
		"value_type": "string"
	}

	const refersionId = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_id',
			'value': data.id
		}
	}

	const refersionEmail = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_email',
			'value': data.email
		}
	}

	const refersionFirst = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_first_name',
			'value': data.first_name
		}
	}

	const refersionLast = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_last_name',
			'value': data.last_name
		}
	}

	const customerId = {
		'metafield': {
			...metafieldData,
			'key': 'customer_id',
			'value': customer_id
		}
	}

	try {
		const resp = axios.all([
			addMetafield({ url: url, data: refersionId }),
			addMetafield({ url: url, data: refersionEmail }),
			addMetafield({ url: url, data: refersionFirst }),
			addMetafield({ url: url, data: refersionLast }),
			addMetafield({ url: url, data: customerId })
		])

		return resp
	} catch (error) {
		console.log({error});
	}
}


const getAffiliate = async (id) => {
		const data = {
			'affiliate_code': '8d3a6e'
		}

		const headers = {
			'Refersion-Public-Key': refersion_public,
			'Refersion-Secret-Key': refersion_secret
		}

		try {
			const resp = await axios.post(affiliateUrl, data, { headers: headers });
			return resp

		} catch (error) {
			console.log({error});
		}

	}

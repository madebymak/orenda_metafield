import axios from 'axios';
import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const accessUrl = process.env.shopify_secret;
const affiliateUrl = process.env.refersion_affiliate;
const refersion_public = process.env.refersion_public_key;
const refersion_secret = process.env.refersion_secret_key;
const talkableUrl = process.env.talkable_url;
const talkableKey = process.env.talkable_key;

export const updateOrder = (req, res) => {
	res.json();

	const order = req.body;
	const orderId = order.id;
	const customerId = order.customer.id;
	const orderNote = order.note;
	const customerEmail = order.email;

	let referralId
	let referralType;

	const customerUrl = `${accessUrl}/customers/${customerId}/metafields.json`;
	const orderUrl = `${accessUrl}/orders/${orderId}/metafields.json`;

	if (orderNote) {
		const orderNoteSplit = orderNote.split('&');
		referralId = orderNoteSplit[0].split('=')[1];
		referralType = orderNoteSplit[1].split('=')[1];

		let referralEmail;

		// check affilate type
		if (referralType == 'refersion') {
			let refersionData;

			referralId = referralId.split('.')[1];

			getAffiliate(referralId)
				.then((res) => {
					if (res.status == 200) {
						refersionData = res.data;
					}
				})
				.then(() => {
					// add order metafields
					addOrderMetafields({ url: orderUrl, data: refersionData, type: referralType });
				})
				.then(() => {
					// check customer metafields
					getMetafields(customerUrl)
						.then((res) => {
							const customerMetafieldList = res.data.metafields;
							let referralExist = false;
							let infotraxExist = false;

							// check if referal id metafield already exists
							referralExist = customerMetafieldList.find(metafield => metafield.key == 'referrer_id');

							// check if infotrax_referer_id exists
							infotraxExist = customerMetafieldList.find(metafield => metafield.key == 'infotrax_referer_id');

							// add referal email to customer metafields if new
							if (referralExist || infotraxExist) {
								console.log('skipped');
							} else {
								addRefersionCustomerMetafields({ customer_id: customerId, url: customerUrl, data: refersionData })
							}
						})
				})
		} else {
			// get referral email
			getTalkableReferal(customerEmail)
				.then((resp) => {
					referralEmail = resp.data.result.person.referred_by;

					let talkableReferral = {
						'email': referralEmail,
						'id': ''
					}

					// save referral email to order
					addOrderMetafields({ url: orderUrl, data: talkableReferral, type: referralType });
				})
				.then(() => {
					// check customer metafields
					getMetafields(customerUrl)
						.then((res) => {
							const customerMetafieldList = res.data.metafields;
							let referralExist = false;
							let infotraxExist = false;

							// check if referal id metafield already exists
							referralExist = customerMetafieldList.find(metafield => metafield.key == 'referrer_email');

							// check if infotrax_referer_id exists
							infotraxExist = customerMetafieldList.find(metafield => metafield.key == 'infotrax_referer_id');

							// add referal email to customer metafields if new
							if (referralExist || infotraxExist) {
								console.log('skipped');
							} else {
								addTalkableCustomerMetafields({ url: customerUrl, email: referralEmail })
							}
						})
					});
		}
	}
}

const getTalkableReferal = async (id) => {
	var url = `${talkableUrl}/people/${id}?site_slug=orenda-international`;

	const headers = {
		'Authorization': `Basic ${talkableKey}`
	}

	try {
		const resp = await axios.get(url, { headers: headers });
		return resp
	} catch (error) {
		console.log({ error });
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

	const referrerEmail = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_email',
			'value': data.email
		}
	}

	const referrerId = {
		'metafield': {
			...metafieldData,
			'key': 'refersion_id',
			'value': data.id
		}
	}

	const referrerType = {
		'metafield': {
			...metafieldData,
			'key': 'referral_type',
			'value': type
		}
	}

	let updateOrderMetafields = [
		addMetafield({ url: url, data: referrerEmail }),
		addMetafield({ url: url, data: referrerType })
	];

	if (data.id !== '') {
		updateOrderMetafields.push(addMetafield({ url: url, data: referrerId }))
	}

	try {
		const resp = axios.all(updateOrderMetafields);
		return resp
	} catch (error) {
		console.log({error});
	}
}

const addTalkableCustomerMetafields = ({ url, email }) => {
	const metafieldData = {
		"namespace": "custom_fields",
		"key": "",
		"value": "",
		"value_type": "string"
	}

	const talkableEmail = {
		'metafield': {
			...metafieldData,
			'key': 'referrer_email',
			'value': email
		}
	}

	try {
		const resp = axios.all([
			addMetafield({ url: url, data: talkableEmail })
		]);

		return resp
	} catch (error) {
		console.log({error});
	}
 }

// add customer metafields
const addRefersionCustomerMetafields = ({ customer_id, url, data }) => {
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

// get refersion data
const getAffiliate = async (id) => {
	const data = {
		'affiliate_code': id
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

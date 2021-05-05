# Ordenda Affiliate Metafields App

## What It Is
- a node.js app to help update and track Shopify orders placed through a Refersion or Talkable affiliate link
<br>

## What It Does
- when a customer places an order from an affiliate URL, the url is then saved to the order notes (Shopify store theme will need to be updated with custom JS code to save the affiliate URL to the order notes)
- the order is then passed to the node.js app which parses the affiliate info for ID and affiliate type
- app then makes a GET call to the approriate affiliate API to get the affiliate's email
- we then save the affiliate's email to the Shopify order using the Shopify Metafields API
- we also check the Shopify Customer metafield to see if has an affiliate email attached to it and save the affiliate's email if none exists
<br>

## Installation
- coming soon
<br>

## Extra notes
- example .env file template

	```
	// Shopify admin URL
	shopify_secret = ''

	// Shopify private app shared secret
	access_token = ''

	// Refersion API
	refersion_affiliate = 'https://www.refersion.com/api/get_affiliate'
	refersion_public_key = ''
	refersion_secret_key = ''

	// Talkable API
	talkable_url = 'https://www.talkable.com/api/v2'
	talkable_key = ''
	```
	<br>

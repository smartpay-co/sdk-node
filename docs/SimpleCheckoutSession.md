# Simple Checkout Payload

The SDK supports a simpler checkout payload data structure. The SDK will transform it to the
Checkout Session Payload data structure described in the api-doc before post to the API endpoint.

## Sample Payload

```json
{
  "amount": 300,
  "currency": "jpy",
  "captureMethod": null, // defaults to "automatic", possible values: automatic, manual
  "description": "your smartpay order",

  "items": [
    {
      "quantity": 5,
      "label": "price label",
      "name": "Sticker",
      "amount": 200,
      "currency": "jpy",
      "brand": "Nike",
      "categories": [],
      "gtin": "",
      "images": [],
      "reference": "lineitem_abcdef123456789",
      "url": [],
      "description": "",
      "productDescription": "",
      "priceDescription": "",
      "metadata": {},
      "productMetadata": {},
      "priceMetadata": {}
    }
  ],

  "shippingInfo": {
    "address": {
      "line1": "line1",
      "locality": "locality",
      "postalCode": "123",
      "country": "JP"
    },

    "feeAmount": 100,
    "feeCurrency": "JPY"
  },

  "customerInfo": {
    "email": "john@smartpay.co",
    "firstName": "John",
    "lastName": "Doe"
  },

  "reference": "ORDER0001",
  "metadata": {},

  "successUrl": "https://www.myshop.com/success",
  "cancelUrl": "https://www.myshop.com/cancel"
}
```

## Checkout Session Object

- amount: (optional) - The total amount of the order. If not present. The SDK will calculate the amount based on the line items and shipping fee.
- currency: (required) - The currency of the amount. Will use this value as the default currency as the shipping fee currency and the price currency of line items if they are not present.
- captureMethod: (optional)
- items: (array[Item], required) - Array of Items
- shippingInfo: (ShippingInfo, required)
- customerInfo: (required)
- reference: (optional)
- successUrl: (required)
- cancelUrl: (required)
- metadata: (optional)

## Item

The line item in this structure is an object combined [lineItem](https://api-doc.smartpay.co/#line-item),
[priceData](https://api-doc.smartpay.co/#price-data), and [productData](https://api-doc.smartpay.co/#product-data)
from the formal structure.

- amount: (required) - amount in priceData object
- quantity: (required)
- name: (required
- brand: (optional)
- categories: (optional)
- gtin: (optional)
- images: (optional)
- reference: (optional)
- URL: (optional)
- currency: (optional)
- label: (optional)
- description: (optional)
- metadata: (optional)
- productDescription: (optional) - description in productData object
- productMetadata: (optional) - metadata in productData object
- priceDescription: (optional) - description in priceData object
- priceMetadata: (optional) - metadata in priceData object

## ShippingInfo

Shipping info contains [address](<(https://api-doc.smartpay.co/#address)>) and shipping fee.

- address (Address, required)
- feeAmount: (optional)
- feeCurrency: (optional)

## CustomerInfo

This is based on the [Strict Customer Info](https://api-doc.smartpay.co/#customer-info).

- accountAge: (optional)
- emailAddress: (optional)
- firstName: (optional)
- lastName: (optional)
- firstNameKana: (optional)
- lastNameKana: (optional)
- address: (Address, optional)
- phoneNumber, phone: (optional)
- dateOfBirth: (optional)
- legalGender: (optional)
- gender: (optional)
- reference: (optional)

## Address

- line1: (required)
- line2: (optional)
- line3: (optional)
- line4: (optional)
- line5: (optional)
- subLocality: (optional)
- locality: (required)
- administrativeArea: (optional)
- postalCode: (required)
- country: (required)
- addressType: (optional)

# Checkout Session Payload

## Sample Payload

```json
{
  "amount": 300,
  "currency": "jpy",
  "captureMethod": "automatic",
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
      "url": "",
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

  "successUrl": "https://www.myshop.com/success",
  "cancelUrl": "https://www.myshop.com/cancel",

  "reference": "ORDER0001",
  "metadata": {}
}
```

## Checkout Session Object

| Name                     | Type         | Description                                                                                                                                                             |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| amount                   | Number       | The total amount of the order. If not present. The SDK will calculate the amount based on the line items and shipping fee.                                              |
| currency                 | String       | Three-letter ISO currency code, in uppercase. Must be a supported currency.                                                                                             |
| items                    | LineItem[]   | The line items the customer wishes to order.                                                                                                                            |
| shippingInfo             | ShippingInfo | Shipping Information                                                                                                                                                    |
| customerInfo             | CustomerInfo | Customer Information, the details provided here are used to pre-populate forms for your customer's checkout experiences.                                                |
| captureMethod (optional) | String       | `manual` or `automatic`. Defualt is `automatic`                                                                                                                         |
| successUrl               | String       | The URL the customer will be redirected to if the Checkout Session completed successfully. This means the Checkout succeeded, i.e. the customer authorized the order.   |
| cancelUrl                | String       | The URL the customer will be redirected to if the Checkout Session hasn't completed successfully. This means the Checkout failed, or the customer decided to cancel it. |
| locale (optional)        | String       | `en` or `ja`                                                                                                                                                            |
| description (optional)   | String       | An arbitrary - ideally descriptive - long form explanation of the Order, meant to be displayed to the customer.                                                         |
| reference (optional)     | String       | A - ideally unique - string to reference the Order in your system (e.g. an order ID, etc.).                                                                             |
| metadata (optional)      | Object       | Set of up to 20 key-value pairs that you can attach to the object.                                                                                                      |

## LineItem

| Name                          | Type     | Description                                                                                                         |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| amount                        | Number   | The unit amount of this line item.                                                                                  |
| quantity                      | Number   | The quantity of products. Needs to be positive or zero.                                                             |
| name                          | String   | The product’s name, meant to be displayed to the customer.                                                          |
| brand (optional)              | String   | The brand of the Product.                                                                                           |
| gtin (optional)               | String   | The Global Trade Item Number of the Product.                                                                        |
| images (optional)             | String[] | A list of up to 8 URLs of images for this product, meant to be displayed to the customer.                           |
| reference (optional)          | String   | A - ideally unique - string to reference the Product in your system (e.g. a product ID, etc.).                      |
| url (optional)                | String   | A URL of the publicly accessible page for this Product on your site or store.                                       |
| currency (optional)           | String   | Three-letter ISO currency code, in uppercase. Must be a supported currency.                                         |
| label (optional)              | String   | A brief description of the price, not visible to customers.                                                         |
| description (optional)        | String   | An arbitrary - ideally descriptive - long form explanation of the Line Item, meant to be displayed to the customer. |
| metadata (optional)           | Object   | Set of up to 20 key-value pairs that you can attach to the object.                                                  |
| productDescription (optional) | String   | An arbitrary - ideally descriptive - long form explanation of the Product, meant to be displayed to the customer.   |
| productMetadata (optional)    | Object   | Set of up to 20 key-value pairs that you can attach to the product object.                                          |
| priceDescription (optional)   | String   | An arbitrary - ideally descriptive - long form explanation of the Price, meant to be displayed to the customer.     |
| priceMetadata (optional)      | Object   | Set of up to 20 key-value pairs that you can attach to the price object.                                            |

## ShippingInfo

Shipping info contains [address](<(https://api-doc.smartpay.co/#address)>) and shipping fee.

| Name                   | Type    | Description                                                                                                           |
| ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| address                | Address | The shipping address                                                                                                  |
| addressType (optional) | String  | Address Type: `gift`, `home`, `locker`, `office` or `store`.                                                          |
| carrierName (optional) | String  | The delivery service that shipped a physical product, such as Yamato, Seino, Fedex, UPS, etc.                         |
| feeAmount (optional)   | Number  | The shipping fee.                                                                                                     |
| feeCurrency (optional) | String  | Three-letter ISO currency code, in uppercase. Must be a supported currency.                                           |
| reference (optional)   | String  | The reference for the shipment (e.g. the tracking number for a physical product, obtained from the delivery service). |

## CustomerInfo

This is based on the [Strict Customer Info](https://api-doc.smartpay.co/#customer-info).

| Name                     | Type    | Description                                                                                                                                                                                 |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accountAge (optional)    | Number  | The age of the customer's account on your website in days.                                                                                                                                  |
| emailAddress (optional)  | String  | The email address of your customer. The email address specified here will be used to pre-populate the email address field in your customer's checkout experiences.                          |
| firstName (optional)     | String  | The first name of your customer. The name specified here will be used to pre-populate the first name field in your customer's checkout experiences.                                         |
| lastName (optional)      | String  | The last name of your customer. The name specified here will be used to pre-populate the last name field in your customer's checkout experiences.                                           |
| firstNameKana (optional) | String  | The kana version of the first name of your customer. The name specified here will be used to pre-populate the kana version of the first name field in your customer's checkout experiences. |
| lastNameKana (optional)  | String  | The kana version of the last name of your customer. The name specified here will be used to pre-populate the kana version of the last name field in your customer's checkout experiences.   |
| address (optional)       | Address | The customer's address                                                                                                                                                                      |
| phoneNumber (optional)   | String  | The phone number of your customer. The phone number specified here will be used to pre-populate the phone number field in your customer's checkout experiences.                             |
| dateOfBirth (optional)   | String  | The date of birth of your customer. The date of birth specified here will be used to pre-populate the date of birth field in your customer's checkout experiences.                          |
| legalGender (optional)   | String  | The (legal) gender of your customer. The gender specified here will be used to pre-populate the gender field in your customer's checkout experiences.                                       |
| reference (optional)     | String  | The ID of the user in your system                                                                                                                                                           |

## Address

| Name                          | Type   | Description                                                                                                      |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| line1                         | String | Street address.                                                                                                  |
| line2 (optional)              | String | Building name and room number.                                                                                   |
| line3 (optional)              | String |                                                                                                                  |
| line4 (optional)              | String |                                                                                                                  |
| line5 (optional)              | String |                                                                                                                  |
| subLocality (optional)        | String |                                                                                                                  |
| locality                      | String | The city or town of a location, with a maximum of 80 characters (e.g. 目黒区).                                   |
| administrativeArea (optional) | String | The province, state, prefecture, county, etc. of a location. In Japan it refers to the prefecture (e.g. 東京都). |
| postalCode                    | String | The Postal Code.                                                                                                 |
| country                       | String | The country as represented by the two-letter ISO 3166-1 code.                                                    |

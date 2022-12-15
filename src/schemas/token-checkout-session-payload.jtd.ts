export default {
  definitions: {
    address: {
      properties: {
        line1: { type: 'string' },
        locality: { type: 'string' },
        country: { type: 'string' },
        postalCode: { type: 'string' },
      },
      optionalProperties: {
        line2: { type: 'string' },
        line3: { type: 'string' },
        line4: { type: 'string' },
        line5: { type: 'string' },
        administrativeArea: { type: 'string' },
        subLocality: { type: 'string' },
        addressType: { type: 'string' },
      },
      additionalProperties: true,
    },
    customer: {
      optionalProperties: {
        accountAge: { type: 'uint32' },
        emailAddress: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phoneNumber: { type: 'string' },
        firstNameKana: { type: 'string' },
        lastNameKana: { type: 'string' },
        address: { ref: 'address' },
        dateOfBirth: { type: 'string' },
        legalGender: { type: 'string' },
        reference: { type: 'string' },
      },
      additionalProperties: true,
    },
  },

  properties: {
    mode: { type: 'string' },
    customerInfo: { ref: 'customer' },

    successUrl: { type: 'string' },
    cancelUrl: { type: 'string' },
  },
  optionalProperties: {
    description: { type: 'string' },
    reference: { type: 'string' },
    locale: { type: 'string' },
  },
  additionalProperties: true,
};

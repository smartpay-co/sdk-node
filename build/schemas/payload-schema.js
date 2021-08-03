var payloadSchema = {
    properties: {
        amount: {
            type: "uint32",
        },
        consumerData: {
            properties: {
                address: {
                    properties: {
                        administrativeArea: {
                            type: "string",
                        },
                        country: {
                            type: "string",
                        },
                        line1: {
                            type: "string",
                        },
                        postalCode: {
                            type: "string",
                        },
                    },
                    optionalProperties: {
                        line2: {
                            type: "string",
                        },
                        line3: {
                            type: "string",
                        },
                        line4: {
                            type: "string",
                        },
                        line5: {
                            type: "string",
                        },
                        locality: {
                            type: "string",
                        },
                        subLocality: {
                            type: "string",
                        },
                    },
                },
                emailAddress: {
                    type: "string",
                },
                name1: {
                    type: "string",
                },
                name2: {
                    type: "string",
                },
                phoneNumber: {
                    type: "string",
                },
            },
            optionalProperties: {
                name1Kana: {
                    type: "string",
                },
                name2Kana: {
                    type: "string",
                },
                dateOfBirth: {
                    type: "string",
                },
                legalGender: {
                    type: "string",
                },
                reference: {
                    type: "string",
                },
            },
        },
        orderItems: {
            elements: {
                properties: {
                    currency: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    price: {
                        type: "uint32",
                    },
                    quantity: {
                        type: "uint8",
                    },
                },
                optionalProperties: {
                    description: {
                        type: "string",
                    },
                    image: {
                        type: "string",
                    },
                },
            },
        },
    },
};
export default payloadSchema;

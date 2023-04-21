export interface OrganizationData {
    id: string,
    merlotId: string,
    organizationName: string,
    organizationLegalName: string,
    registrationNumber: string,
    termsAndConditionsLink: string,
    legalAddress: {
      countryCode: string,
      postalCode: string,
      addressCode: string,
      city: string,
      street: string
    },

    activeRepresentant: boolean,
    passiveRepresentant: boolean
  }
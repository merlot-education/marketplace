import { ISpringPage } from "../common-views/paging-footer/page-data";

export interface IOrganizationData {
    metadata?: any,
    selfDescription: {
      verifiableCredential: {
        credentialSubject: {
          "@id": string,
          "merlot:merlotId": string,
          "gax-trust-framework:legalName": IStringTypeValue,
          "gax-trust-framework:registrationNumber": IRegistrationNumber,
          "gax-trust-framework:legalAddress": IVCardAddress,
          "merlot:orgaName": IStringTypeValue,
          "merlot:addressCode": IStringTypeValue
        }
      }
    }
    activeRepresentant: boolean,
    passiveRepresentant: boolean
  }

export interface IPageOrganizations extends ISpringPage {
  content: IOrganizationData[];
}

interface IStringTypeValue {
  "@value": string
}

interface IRegistrationNumber {
  "gax-trust-framework:local": IStringTypeValue
}

interface IVCardAddress {
  "vcard:country-name": IStringTypeValue,
  "vcard:street-address": IStringTypeValue,
  "vcard:locality": IStringTypeValue,
  "vcard:postal-code": IStringTypeValue
}

export interface ConnectorData {
  id: string,
  orgaId: string,
  connectorId: string,
  connectorEndpoint: string,
  connectorAccessToken: string,
  bucketNames: string[]
}
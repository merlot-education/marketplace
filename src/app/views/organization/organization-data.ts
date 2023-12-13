import { ISpringPage } from '@merlot-education/m-basic-ui';
import { ITermsAndConditions } from '../serviceofferings/serviceofferings-data';

export interface IOrganizationData {
  metadata?: any;
  selfDescription: {
    verifiableCredential: {
      credentialSubject: {
        '@id': string;
        'merlot:merlotId': string;
        'gax-trust-framework:legalName': IStringTypeValue;
        'gax-trust-framework:registrationNumber': IRegistrationNumber;
        'gax-trust-framework:legalAddress': IVCardAddress;
        'gax-trust-framework:headquarterAddress': IVCardAddress;
        'merlot:orgaName': IStringTypeValue;
        'merlot:termsAndConditions': ITermsAndConditions;
      };
    };
  };
  activeRepresentant: boolean;
  passiveRepresentant: boolean;
  activeFedAdmin: boolean;
  passiveFedAdmin: boolean;
}

export interface IPageOrganizations extends ISpringPage {
  content: IOrganizationData[];
}

interface IStringTypeValue {
  '@value': string;
}

export interface IRegistrationNumber {
  'gax-trust-framework:local': IStringTypeValue;
  'gax-trust-framework:EUID': IStringTypeValue;
  'gax-trust-framework:EORI': IStringTypeValue;
  'gax-trust-framework:vatID': IStringTypeValue;
  'gax-trust-framework:leiCode': IStringTypeValue;
}

interface IVCardAddress {
  'vcard:country-name': IStringTypeValue;
  'vcard:street-address': IStringTypeValue;
  'vcard:locality': IStringTypeValue;
  'vcard:postal-code': IStringTypeValue;
}

export interface ConnectorData {
  id: string;
  orgaId: string;
  connectorId: string;
  connectorEndpoint: string;
  connectorAccessToken: string;
  bucketNames: string[];
}

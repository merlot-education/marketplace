import { ISpringPage } from '@merlot-education/m-basic-ui';
import { INodeKindIRITypeId } from '../serviceofferings/serviceofferings-data';

export interface IOrganizationData {
  id: string;
  metadata: IOrganizationMetadata;
  selfDescription: {
    id: string;
    verifiableCredential: IVerifiableCredential[];
  };
  activeRepresentant: boolean;
  passiveRepresentant: boolean;
  activeFedAdmin: boolean;
  passiveFedAdmin: boolean;
}

export interface IVerifiableCredential {
  credentialSubject: ICredentialSubject;
}

export interface ICredentialSubject {
  id: string;
  type: string;
  '@context': Map<string, string>
}

export interface ILegalParticipantCs extends ICredentialSubject {
  'gx:legalRegistrationNumber': INodeKindIRITypeId[];
  'gx:parentOrganization': INodeKindIRITypeId[];
  'gx:subOrganization': INodeKindIRITypeId[];
  'gx:legalAddress': IGxVcard;
  'gx:headquarterAddress': IGxVcard;
  'gx:name': string;
  'gx:description': string;
}

export interface IGxVcard {
  'gx:countryCode': string;
  'gx:countrySubdivisionCode': string;
  'vcard:street-address': string;
  'vcard:locality': string;
  'vcard:postal-code': string;
}

export interface ILegalRegistrationNumberCs extends ICredentialSubject {
  'gx:taxID': string;
  'gx:EUID': string;
  'gx:EORI': string;
  'gx:vatID': string;
  'gx:leiCode': string;
}

export interface IMerlotLegalParticipantCs extends ICredentialSubject {
  'merlot:legalName': string;
  'merlot:legalForm': string;
  'merlot:termsAndConditions': IParticipantTermsAndConditions;
}

export interface IParticipantTermsAndConditions {
  'merlot:URL': string;
  'merlot:hash': string;
}

export interface IPageOrganizations extends ISpringPage {
  content: IOrganizationData[];
}

export interface ConnectorData {
  connectorId: string;
  connectorEndpoint: string;
  connectorAccessToken: string;
  ionosS3ExtensionConfig?: IonosS3ExtensionConfig;
}

export interface IonosS3ExtensionConfig {
  buckets: IonosS3Bucket[];
}

export interface IonosS3Bucket {
  name: string;
  storageEndpoint: string;
}

export interface IOrganizationMetadata {
  orgaId: string;
  mailAddress: string;
  membershipClass: string;
  active: boolean;
  connectors: ConnectorData[];
  organisationSignerConfigDto: IOrganisationSignerConfig;
  signedBy?: string;
  dapsCertificates: IDapsCertificate[];
}

export interface IDapsCertificate {
  clientName: string;
  clientId: string;
  keystore: string;
  password: string;
  scope: string;
}

export interface IOrganisationSignerConfig {
  privateKey: string;
  verificationMethod: string;
  merlotVerificationMethod :  string;
}
import { ISpringPage } from '@merlot-education/m-basic-ui';
import { IOfferings } from '../serviceofferings/serviceofferings-data';

export interface IContractBasic {
  id: string;
  creationDate: string;
  offering: IOfferings;
  providerLegalName: string;
  providerId: string;
  providerActive: boolean;
  consumerLegalName: string;
  consumerId: string;
  consumerActive: boolean;
  state: string;
}

export interface IContract {
  type: string;
  details: IContractDetails;
  negotiation: IContractNegotiation;
  provisioning: IContractProvisioning;
  offering: IOfferings;
}

export interface IDataDeliveryContract extends IContract {
  negotiation: IDataDeliveryContractNegotiation;
  provisioning: IDataDeliveryContractProvisioning;
}

export interface ISaasContract extends IContract {
  negotiation: ISaasContractNegotiation;
}

export interface IContractDetails {
  id: string;
  creationDate: string;
  providerId: string;
  termsAndConditions: IContractTnc[];
  providerLegalName: string;
  providerActive: boolean;
  consumerId: string;
  consumerLegalName: string;
  consumerActive: boolean;
  state: string;
  providerSignerUser: string;
  providerSignature: string;
  providerSignatureDate: string;
  consumerSignerUser: string;
  consumerSignature: string;
  consumerSignatureDate: string;
}

export interface IContractNegotiation {
  runtimeSelection?: string;
  additionalAgreements?: string;
  attachments: string[];
  consumerTncAccepted: boolean;
  consumerAttachmentsAccepted: boolean;
  providerTncAccepted: boolean;
}

export interface IContractTnc {
  content: string;
  hash: string;
}

export interface IContractProvisioning {
  validUntil: string;
}

export interface IDataDeliveryContractProvisioning
  extends IContractProvisioning {
  dataAddressType: string;
  dataAddressSourceBucketName: string;
  dataAddressSourceFileName: string;
  selectedProviderConnectorId: string;
  dataAddressTargetBucketName: string;
  dataAddressTargetPath: string;
  selectedConsumerConnectorId: string;
}

export interface IDataDeliveryContractNegotiation extends IContractNegotiation {
  exchangeCountSelection: string;
}

export interface ISaasContractNegotiation extends IContractNegotiation {
  userCountSelection: string;
}

export class IEdcIdResponse {
  id: string;
}

export class IEdcNegotiationStatus {
  id: string;
  state: string;
  contractAgreementId?: string;
}

export class IEdcTransferStatus {
  id: string;
  state: string;
}

export interface IPageContracts extends ISpringPage {
  content: IContractBasic[];
}

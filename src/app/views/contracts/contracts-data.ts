import { ISpringPage } from "../common-views/paging-footer/page-data";
import { IOfferings } from "../serviceofferings/serviceofferings-data";

export interface IContractBasic {
  id: string,
  creationDate: string,
  offering: IOfferings,
  providerLegalName: string,
  providerId: string,
  consumerLegalName: string,
  consumerId: string,
  state: string
}

export interface IContract {
  type: string,
  details: IContractDetails,
  negotiation: IContractNegotiation,
  provisioning: IContractProvisioning,
  offering: IOfferings
}

export interface IContractDetails {
  id: string,
  creationDate: string,
  providerId: string,
  termsAndConditions: IContractTnc,
  providerLegalName: string,
  consumerId: string,
  consumerLegalName: string,
  state: string,
  providerTncUrl: string
}

export interface IContractNegotiation {
  runtimeSelection?: string,
  additionalAgreements?: string,
  attachments: string[],
  consumerTncAccepted: boolean,
  consumerAttachmentsAccepted: boolean,
  providerTncAccepted: boolean
}

export interface IContractTnc {
  content: string,
  hash: string,
}

export interface IContractProvisioning {
  validUntil: string
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
    content: IContract[];
}
import { ISpringPage } from "../common-views/paging-footer/page-data";
import { LoginComponent } from "../pages/login/login.component";
import { IOfferings } from "../serviceofferings/serviceofferings-data";

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
  consumerMerlotTncAccepted: boolean,
  consumerOfferingTncAccepted: boolean,
  consumerProviderTncAccepted: boolean,
  providerMerlotTncAccepted: boolean
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
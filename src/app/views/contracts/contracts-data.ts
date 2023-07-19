import { ISpringPage } from "../common-views/paging-footer/page-data";
import { LoginComponent } from "../pages/login/login.component";

export class IContractBasic {
    id: string;
    type:string;
    state: string;
    creationDate: string;
    offeringId: string;
    offeringName: string;
    providerId: string;
    consumerId: string;
}

export class IContractDetailed extends IContractBasic {
  runtimeSelection?: string;
  consumerMerlotTncAccepted: boolean;
  providerMerlotTncAccepted: boolean;
  consumerOfferingTncAccepted: boolean;
  consumerProviderTncAccepted: boolean;
  providerTncUrl: string;
  additionalAgreements?: string;
  offeringAttachments: string[];
  serviceContractProvisioning: {
    validUntil?: string;
  }
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

export class ISaasContractDetailed extends IContractDetailed {
  userCountSelection: string;
}

export class IDataDeliveryContractDetailed extends IContractDetailed {
  exchangeCountSelection?: string;
}

export interface IPageContracts extends ISpringPage {
    content: IContractBasic[];
  }
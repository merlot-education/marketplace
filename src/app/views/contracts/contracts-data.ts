export interface IContractBasic {
    id: string;
    state: string;
    creationDate: string;
    offeringId: string;
    offeringName: string;
    providerId: string;
    consumerId: string;
}

export interface IContractDetailed extends IContractBasic {
  runtimeSelection?: string;
  exchangeCountSelection?: string;
  userCountSelection: string;
  consumerMerlotTncAccepted: boolean;
  providerMerlotTncAccepted: boolean;
  consumerOfferingTncAccepted: boolean;
  consumerProviderTncAccepted: boolean;
  providerTncUrl: string;
  additionalAgreements?: string;
  offeringAttachments: string[];
}

export interface IPageContracts {
    content: IContractBasic[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      offset: number;
      pageNumber: number;
      pageSize: number;
      paged: boolean;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      }
      unpaged: boolean;
    }
    size: number;
    totalElements: number;
    totalPages: number;
  }

export let demoContracts: IContractBasic[] = [
    {
        id: "1234",
        offeringId: "ServiceOffering:ee288fc1-ede7-4a6d-9db2-4034d60fd2fd",
        creationDate: "01.01.2023",
        providerId: "Participant:20",
        consumerId: "Participant:10",
        offeringName: "DemoOffering1",
        state: "IN_DRAFT"
    },
    {
        id: "5678",
        offeringId: "ServiceOffering:e5268e62-2bb7-4b6b-be73-c421e27d8ea9",
        creationDate: "01.01.2023",
        providerId: "Participant:10",
        consumerId: "Participant:20",
        offeringName: "DemoOffering2",
        state: "RELEASED"
    },
    {
        id: "1357",
        offeringId: "ServiceOffering:e7391eee-f758-48b4-b306-d49a046a6ee4",
        creationDate: "01.01.2023",
        providerId: "Participant:30",
        consumerId: "Participant:10",
        offeringName: "DemoOffering3",
        state: "DELETED"
    }
]
export interface IOfferings {
  id: string;
  sdHash: string;
  creationDate: string;
  offeredBy: string;
  merlotState: string;
  type: string;
  name: string;
}

export interface IOfferingsDetailed extends IOfferings {
  description: string;
  modifiedDate: string;
  dataAccessType: string;
  exampleCosts: string;
  attachments: string[];
  termsAndConditions: {
    url: string;
    hash: string;
  }[];
  runtimes: {
    runtimeCount?: number;
    runtimeMeasurement?: string;
    runtimeUnlimited?: boolean;
  }[];
  hardwareRequirements?: string;
  allowedUserCounts?: {
    userCountUpTo?: number;
    userCountUnlimited?: boolean;
  }[];
  dataExchangeCounts?: {
    exchangeCountUpTo?: number;
    exchangeCountUnlimited?: boolean;
  }[]
}


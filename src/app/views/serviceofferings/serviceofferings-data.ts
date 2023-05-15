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
  attachments: string;
  termsAndConditions: {
    url: string;
    hash: string;
  };
  runtime: {
    runtimeCount?: number;
    runtimeMeasurement?: string;
    runtimeUnlimited?: boolean;
  };
  hardwareRequirements?: string;
  allowedUserCount?: {
    userCountUpTo?: number;
    userCountUnlimited?: boolean;
  };
  dataExchangeCount?: {
    exchangeCountUpTo?: number;
    exchangeCountUnlimited?: boolean;
  }
}


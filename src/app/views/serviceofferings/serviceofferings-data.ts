import { ISpringPage } from "../common-views/paging-footer/page-data";

export interface IPageOfferings extends ISpringPage {
  content: IOfferings[];
}

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
  exampleCosts: string;
  attachments: string[];
  termsAndConditions: {
    content: string;
    hash: string;
  }[];
  runtimeOption: {
    runtimeCount?: number;
    runtimeMeasurement?: string;
    runtimeUnlimited?: boolean;
  }[];
}

export let serviceFileNameDict: { [key: string]: {
  name: string;
  type: string;
}} = {
    'Merlot Saas.json': {
      name: 'Webanwendung',
      type: "merlot:MerlotServiceOfferingSaaS"
    },
    'Merlot DataDelivery.json': {
      name: 'Datenlieferung',
      type: "merlot:MerlotServiceOfferingDataDelivery"
  },
    'Merlot CoopContract.json': {
      name: 'Kooperationsvertrag',
      type: "merlot:MerlotServiceOfferingCooperation"
  },
};

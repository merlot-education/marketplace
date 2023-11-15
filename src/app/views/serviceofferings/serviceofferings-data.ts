import { ISpringPage } from '@merlot-education/m-basic-ui';

export interface IPageOfferings extends ISpringPage {
  content: IOfferings[];
}

export interface IPageBasicOfferings extends ISpringPage {
  content: IBasicOffering[];
}

export interface IOfferings {
  metadata: {
    state: string;
    creationDate: string;
    modifiedDate: string;
  };
  providerDetails: {
    providerId: string;
    providerLegalName: string;
  };
  selfDescription: {
    verifiableCredential: {
      credentialSubject: {
        '@id': string;
        '@type': string;
        'gax-core:offeredBy': INodeKindIRITypeId;
        'gax-core:providedBy': INodeKindIRITypeId;
        'gax-trust-framework:name': IStringTypeValue;
        'gax-trust-framework:termsAndConditions': ITermsAndConditions[];
        'dct:description'?: IStringTypeValue;
        'merlot:creationDate': IStringTypeValue;
        'merlot:attachments'?: IStringTypeValue[];
        'merlot:exampleCosts'?: IStringTypeValue;
        'merlot:runtimeOption': IRuntime[];
        'merlot:merlotTermsAndConditionsAccepted': boolean;
      };
    };
  };
}

export interface IBasicOffering {
  id: string;
  type: string;
  state: string;
  name: string;
  creationDate: string;
  providerLegalName: string;
}

export interface IStringTypeValue {
  '@value': string;
}

export interface INumberTypeValue {
  '@value': number;
}

export interface INodeKindIRITypeId {
  '@id': string;
}

export interface ITermsAndConditions {
  'gax-trust-framework:content': IStringTypeValue;
  'gax-trust-framework:hash': IStringTypeValue;
}

export interface IRuntime {
  'merlot:runtimeCount': INumberTypeValue;
  'merlot:runtimeMeasurement': IStringTypeValue;
}

export let serviceFileNameDict: {
  [key: string]: {
    name: string;
    type: string;
  };
} = {
  'Merlot Saas.json': {
    name: 'Webanwendung',
    type: 'merlot:MerlotServiceOfferingSaaS',
  },
  'Merlot DataDelivery.json': {
    name: 'Datenlieferung',
    type: 'merlot:MerlotServiceOfferingDataDelivery',
  },
  'Merlot CoopContract.json': {
    name: 'Kooperationsvertrag',
    type: 'merlot:MerlotServiceOfferingCooperation',
  },
};

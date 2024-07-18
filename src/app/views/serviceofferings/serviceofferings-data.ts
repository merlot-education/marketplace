/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { ISpringPage } from '@merlot-education/m-basic-ui';
import { ICredentialSubject, IVerifiablePresentation } from '../organization/organization-data';

export const TBR_OFFERING_ID: string = "urn:uuid:WILL-BE-GENERATED-BY-MERLOT";

export interface IPageOfferings extends ISpringPage {
  content: IServiceOffering[];
}

export interface IPageBasicOfferings extends ISpringPage {
  content: IBasicOffering[];
}

export interface IServiceOffering {
  metadata: {
    state: string;
    creationDate: string;
    modifiedDate: string;
    signedBy?: string;
  };
  providerDetails: {
    providerId: string;
    providerLegalName: string;
  };
  selfDescription: IVerifiablePresentation
}

export interface IGxServiceOfferingCs extends ICredentialSubject {
  "gx:providedBy": INodeKindIRITypeId;
  "gx:termsAndConditions": IServiceOfferingTermsAndConditions[];
  "gx:policy": string[];
  "gx:dataProtectionRegime": string[];
  "gx:dataAccountExport": IDataAccountExport[];
  "gx:name": string;
  "gx:description": string;
}

export interface IMerlotServiceOfferingCs extends ICredentialSubject {
  "merlot:creationDate": string;
  "merlot:exampleCosts": string;
  "merlot:runtimeOption": IOfferingRuntime[];
  "merlot:merlotTermsAndConditionsAccepted": boolean;
}

export interface IMerlotSaasServiceOfferingCs extends ICredentialSubject {
  "merlot:hardwareRequirements": string;
  "merlot:userCountOption": IAllowedUserCount[];
}

export interface IMerlotDataDeliveryServiceOfferingCs extends ICredentialSubject {
  "merlot:dataAccessType": string;
  "merlot:dataTransferType": string;
  "merlot:exchangeCountOption": IDataExchangeCount[];
}

export interface IMerlotCoopContractServiceOfferingCs extends ICredentialSubject {
}

export interface IServiceOfferingTermsAndConditions {
  'gx:URL': string;
  'gx:hash': string;
}

export interface IDataAccountExport {
  "gx:requestType": string;
  "gx:accessType": string;
  "gx:formatType": string;
}

export interface IBasicOffering {
  id: string;
  type: string;
  state: string;
  name: string;
  creationDate: string;
  providerLegalName: string;
}


export interface INodeKindIRITypeId {
  '@id': string;
}

export interface IOfferingRuntime {
  'merlot:runtimeCount': number;
  'merlot:runtimeMeasurement': string;
}

export interface IAllowedUserCount {
  "merlot:userCountUpTo": number;
}

export interface IDataExchangeCount {
  "merlot:exchangeCountUpTo": number;
}

export let serviceFileNameDict: {
  [key: string]: {
    name: string;
    type: string;
  };
} = {
  'saas': {
    name: 'Webanwendung',
    type: 'merlot:MerlotSaasServiceOffering',
  },
  'datadelivery': {
    name: 'Datenlieferung',
    type: 'merlot:MerlotDataDeliveryServiceOffering',
  },
  'coopcontract': {
    name: 'Kooperationsvertrag',
    type: 'merlot:MerlotCoopContractServiceOffering',
  },
};

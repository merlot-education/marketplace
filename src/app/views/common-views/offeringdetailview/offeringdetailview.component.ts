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

import { Component, Input } from '@angular/core';
import { IServiceOffering } from '../../serviceofferings/serviceofferings-data';
import { ServiceofferingApiService } from 'src/app/services/serviceoffering-api.service';
import { asGxServiceOfferingCs, asMerlotCoopContractServiceOfferingCs, asMerlotDataDeliveryServiceOfferingCs, 
  asMerlotSaasServiceOfferingCs, asMerlotServiceOfferingCs, getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd, 
  isGxServiceOfferingCs, isMerlotCoopContractServiceOfferingCs, isMerlotDataDeliveryServiceOfferingCs, 
  isMerlotSaasServiceOfferingCs, isMerlotServiceOfferingCs } from 'src/app/utils/credential-tools';

@Component({
  selector: 'app-offeringdetailview',
  templateUrl: './offeringdetailview.component.html',
  styleUrls: ['./offeringdetailview.component.scss']
})
export class OfferingdetailviewComponent {

  @Input() protected serviceOfferingData: IServiceOffering;
  @Input() protected showVariableFields: boolean = true;

  protected getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd = getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd;
  protected isGxServiceOfferingCs = isGxServiceOfferingCs;
  protected asGxServiceOfferingCs = asGxServiceOfferingCs;
  protected isMerlotServiceOfferingCs = isMerlotServiceOfferingCs;
  protected asMerlotServiceOfferingCs = asMerlotServiceOfferingCs;
  
  protected isMerlotSaasServiceOfferingCs = isMerlotSaasServiceOfferingCs;
  protected asMerlotSaasServiceOfferingCs = asMerlotSaasServiceOfferingCs;
  protected isMerlotDataDeliveryServiceOfferingCs = isMerlotDataDeliveryServiceOfferingCs;
  protected asMerlotDataDeliveryServiceOfferingCs = asMerlotDataDeliveryServiceOfferingCs;
  protected isMerlotCoopContractServiceOfferingCs = isMerlotCoopContractServiceOfferingCs;
  protected asMerlotCoopContractServiceOfferingCs = asMerlotCoopContractServiceOfferingCs;

  constructor(
    protected serviceOfferingApiService : ServiceofferingApiService) {
  }
}

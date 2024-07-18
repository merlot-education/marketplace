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

import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ServiceofferingApiService } from './serviceoffering-api.service';
import { getParticipantIdFromParticipantSd, getServiceOfferingIdFromServiceOfferingSd } from '../utils/credential-tools';

@Injectable({
  providedIn: 'root'
})
export class SdDownloadService {

  constructor(private organizationsApiService: OrganizationsApiService,
    private serviceofferingApiService: ServiceofferingApiService) { }

  
  private downloadSelfDescriptionJson(selfDescription: any, id: string) {
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(selfDescription, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element with download attribute
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selfdescription_' + id + '.json';

    // Programmatically click the anchor element to trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  public downloadParticipantSd(participantId: string) {
    this.organizationsApiService.getOrgaById(participantId).then(result => {
      this.downloadSelfDescriptionJson(result.selfDescription,
        getParticipantIdFromParticipantSd(result.selfDescription)
      );
    });
  }

  public downloadServiceOfferingSd(serviceOfferingId: string) {
    this.serviceofferingApiService.fetchServiceOfferingDetails(serviceOfferingId).then(result => {
      this.downloadSelfDescriptionJson(result.selfDescription,
        getServiceOfferingIdFromServiceOfferingSd(result.selfDescription)
      );
    });
  }
}

import { Injectable } from '@angular/core';
import { OrganizationsApiService } from './organizations-api.service';
import { ServiceofferingApiService } from './serviceoffering-api.service';

@Injectable({
  providedIn: 'root'
})
export class SdDownloadService {

  constructor(private organizationsApiService: OrganizationsApiService,
    private serviceofferingApiService: ServiceofferingApiService) { }

  
  private downloadSelfDescriptionJson(selfDescription: any) {
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(selfDescription, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element with download attribute
    const a = document.createElement('a');
    a.href = url;
    const id = selfDescription.id;
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
      this.downloadSelfDescriptionJson(result.selfDescription);
    });
  }

  public downloadServiceOfferingSd(serviceOfferingId: string) {
    this.serviceofferingApiService.fetchServiceOfferingDetails(serviceOfferingId).then(result => {
      this.downloadSelfDescriptionJson(result.selfDescription);
    });
  }
}

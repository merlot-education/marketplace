import { Component, ViewChild, EventEmitter } from '@angular/core';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { StatusMessageComponent } from '../../common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sd-upload',
  templateUrl: './sd-upload.component.html',
  styleUrls: ['./sd-upload.component.scss']
})
export class SdUploadComponent {
  @ViewChild('importSdJsonStatusMessage') private importSdJsonStatusMessage: StatusMessageComponent;
  @ViewChild('uploadSdJsonStatusMessage') private uploadSdJsonStatusMessage: StatusMessageComponent;

  currentJsonFile: File = null;
  isJsonFileValid = false;

  public uploadCompleteEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private organizationsApiService: OrganizationsApiService
  ) {}

  protected hideAllMessages(){
    this.importSdJsonStatusMessage.hideAllMessages();
    this.uploadSdJsonStatusMessage.hideAllMessages();
  }
  protected importSdJson(event: Event){
    const file:File = (event.target as HTMLInputElement).files[0];

    if (!file) {
      return;
    }

    (event.target as HTMLInputElement).value = null;

    if (file.type !== 'application/json') {
      this.isJsonFileValid = false;
      this.currentJsonFile = null;
      console.log("not json");
      this.importSdJsonStatusMessage.showErrorMessage("Die Datei muss eine JSON-Datei sein.");
      return;
    }

    this.currentJsonFile = file;
    this.isJsonFileValid = true;
  }

  protected uploadOrganizationSdJson(){
    this.uploadSdJsonStatusMessage.showInfoMessage();
    const formData = new FormData();
    formData.append("file", this.currentJsonFile);

    this.organizationsApiService.uploadOrganization(formData).then(result => {
      let orgaName = result.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
      let id = result.selfDescription.verifiableCredential.credentialSubject['@id'];
      this.uploadSdJsonStatusMessage.showSuccessMessage("Name: " + orgaName + ", Merlot ID: " + id);
      this.uploadCompleteEvent.emit(null);
    }).catch((e: HttpErrorResponse) => {
      this.uploadSdJsonStatusMessage.showErrorMessage(e.error.message);
    });
  }

}

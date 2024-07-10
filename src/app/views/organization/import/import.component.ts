/*
 *  Copyright 2023-2024 Dataport AöR
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

import { Component, ViewChild } from '@angular/core';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { StatusMessageComponent } from '../../common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { getOrganizationName, getParticipantIdFromParticipantSd } from 'src/app/utils/credential-tools';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent {
  @ViewChild('importStatusMessage') private importStatusMessage: StatusMessageComponent;
  @ViewChild('addStatusMessage') private addStatusMessage: StatusMessageComponent;
  currentFile: File = null;
  isFileValid = false;

  constructor(
    private organizationsApiService: OrganizationsApiService
  ) {}

  protected hideAllMessages(){
    this.importStatusMessage.hideAllMessages();
    this.addStatusMessage.hideAllMessages();
  }
  
  protected importRegistrationForm(event: Event){
    const file:File = (event.target as HTMLInputElement).files[0];

    if (!file) {
      return;
    }

    (event.target as HTMLInputElement).value = null;

    if (file.type !== 'application/pdf') {
      this.isFileValid = false;
      this.currentFile = null;
      console.log("not pdf");
      this.importStatusMessage.showErrorMessage("Die Datei muss eine PDF-Datei sein.");
      return;
    }

    this.currentFile = file;
    this.isFileValid = true;
  }
  protected addOrganization(){
    this.addStatusMessage.showInfoMessage();
    const formData = new FormData();
    formData.append("file", this.currentFile);

    this.organizationsApiService.addOrganization(formData).then(result => {
      let orgaName = getOrganizationName(result.selfDescription);
      let id = getParticipantIdFromParticipantSd(result.selfDescription);
      this.addStatusMessage.showSuccessMessage("Name: " + orgaName + ", Merlot ID: " + id);
    }).catch((e: HttpErrorResponse) => {
      this.addStatusMessage.showErrorMessage(e.error.message);
    });
  }
}

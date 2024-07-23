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

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { OrganisationWizardExtensionComponent } from 'src/app/wizard-extension/organisation-wizard-extension/organisation-wizard-extension.component';
import { SdDownloadService } from 'src/app/services/sd-download.service';
import { getParticipantIdFromParticipantSd, getRegistrationNumberIdFromParticipantSd } from 'src/app/utils/credential-tools';
import { takeWhile } from 'rxjs';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements AfterViewInit {

  protected selectedOrganization: IOrganizationData = undefined;
  protected jsonViewHidden: boolean = true;

  @ViewChild("wizardExtension") private wizardExtensionComponent: OrganisationWizardExtensionComponent;

  constructor(protected authService: AuthService, 
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected organizationsApiService: OrganizationsApiService, 
    protected sdDownloadService: SdDownloadService,
    private route: ActivatedRoute) {
  }
  ngAfterViewInit(): void {
    let selectedOrgaId = this.route.snapshot.paramMap.get('orgaId');
    if (selectedOrgaId) {
      this.selectOrganization(selectedOrgaId);
    } else {
      this.activeOrgRoleService.activeOrganizationRole.subscribe(orga => {
            this.selectOrganization(getParticipantIdFromParticipantSd(orga.orgaData.selfDescription));
      });
    }
    this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
      this.authService.refreshActiveRoleOrgaData();
      this.refreshSelectedOrganization(getParticipantIdFromParticipantSd(this.selectedOrganization.selfDescription))
    });
  }

  toogleJsonView() {
    this.jsonViewHidden = !this.jsonViewHidden;
  }

  private refreshSelectedOrganization(orgaId: string) {
    this.organizationsApiService.getOrgaById(orgaId).then(result => {
      this.selectedOrganization = result;
    });
  }

  private selectOrganization(orgaId: string) {
    this.selectedOrganization = undefined;
    this.organizationsApiService.getOrgaById(orgaId).then(result => {
      this.selectedOrganization = result;
      this.wizardExtensionComponent.loadShape(
        getParticipantIdFromParticipantSd(this.selectedOrganization.selfDescription),
        getRegistrationNumberIdFromParticipantSd(this.selectedOrganization.selfDescription)).then(_ => {
          this.wizardExtensionComponent.prefillDone
          .pipe(
            takeWhile(done => !done, true)
            )
          .subscribe(done => {
            console.log("wizard done: ", done);
            if (this.wizardExtensionComponent.saveStatusMessage.isMessageVisible.value) {
              window.scrollTo(0,document.body.scrollHeight);
            }
          });
          this.wizardExtensionComponent.prefillOrganisation(result);
        });
    });
  }
}

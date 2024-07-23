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

import { Component, OnInit } from '@angular/core';
import { ConnectorData, IOrganizationData, IPageOrganizations } from "../organization-data";
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { SdDownloadService } from 'src/app/services/sd-download.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { isLegalParticipantCs, isLegalRegistrationNumberCs, isMerlotLegalParticipantCs, 
  asLegalParticipantCs, asLegalRegistrationNumberCs, asMerlotLegalParticipantCs,
  getOrganizationName, 
  getParticipantIdFromParticipantSd} from "../../../utils/credential-tools";


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  readonly ITEMS_PER_PAGE = 9;

  public activeOrganizationsPage: BehaviorSubject<IPageOrganizations> = new BehaviorSubject({
    content: [],
    empty: false,
    first: false,
    last: false,
    number: 0,
    numberOfElements: 0,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 0,
      paged: false,
      sort: {
        empty: false,
        sorted: false,
        unsorted: false
      },
      unpaged: false
    },
    size: 0,
    totalElements: 0,
    totalPages: 0
  });

  public connectorInfo: ConnectorData[] = [];

  protected isLegalParticipantCs = isLegalParticipantCs;
  protected isLegalRegistrationNumberCs = isLegalRegistrationNumberCs;
  protected isMerlotLegalParticipantCs = isMerlotLegalParticipantCs;
  protected asLegalParticipantCs = asLegalParticipantCs;
  protected asLegalRegistrationNumberCs = asLegalRegistrationNumberCs;
  protected asMerlotLegalParticipantCs = asMerlotLegalParticipantCs;
  protected getOrganizationName = getOrganizationName;
  protected getParticipantIdFromParticipantSd = getParticipantIdFromParticipantSd;
  protected initialLoading: boolean = true;

  protected jsonViewHidden: boolean = true;
  selectedOrganisationDetails: IOrganizationData = null;
  private showingModal: boolean = false;

  constructor(
    private organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected sdDownloadService: SdDownloadService,
    private router: Router
  ) { }

  private updateOrgaRepresentation() {
    if (this.activeOrgRoleService.isLoggedIn.value) {
      let representedOrgaIds = Object.values(this.activeOrgRoleService.organizationRoles)
        .filter(orga => orga.roleName === "OrgLegRep")
        .map(orga => getParticipantIdFromParticipantSd(orga.orgaData.selfDescription));
      let administratedOrgaIds = Object.values(this.activeOrgRoleService.organizationRoles)
        .filter(orga => orga.roleName === "FedAdmin")
        .map(orga => getParticipantIdFromParticipantSd(orga.orgaData.selfDescription));
      
      for (let orga of this.activeOrganizationsPage.value.content) {
        if (this.activeOrgRoleService.isActiveAsRepresentative()) {
          this.updateOrgaAsRepresentative(orga, representedOrgaIds);
        } else if (this.activeOrgRoleService.isActiveAsFedAdmin()) {
          this.updateOrgaAsFederator(orga, administratedOrgaIds);
        }
      }
    }
    
  }

  private updateOrgaAsRepresentative(orga: IOrganizationData, representedOrgaIds: string[]) {
    orga.activeFedAdmin = false;
    orga.passiveFedAdmin = false;

    if (getParticipantIdFromParticipantSd(orga.selfDescription) === this.activeOrgRoleService.getActiveOrgaId()) {
      orga.activeRepresentant = true;
      orga.passiveRepresentant = true;
    } else if (representedOrgaIds.includes(getParticipantIdFromParticipantSd(orga.selfDescription))) {
      orga.activeRepresentant = false;
      orga.passiveRepresentant = true;
    }

    if (orga.activeRepresentant) {
        this.connectorInfo = orga.metadata.connectors;
    }
  }

  private updateOrgaAsFederator(orga: IOrganizationData, administratedOrgaIds: string[]) {
    orga.activeRepresentant = false;
    orga.passiveRepresentant = false;

    if (getParticipantIdFromParticipantSd(orga.selfDescription) === this.activeOrgRoleService.getActiveOrgaId()) {
      orga.activeFedAdmin = true;
      orga.passiveFedAdmin = true;
    } else if (administratedOrgaIds.includes(getParticipantIdFromParticipantSd(orga.selfDescription))) {
      orga.activeFedAdmin = false;
      orga.passiveFedAdmin = true;
    }
  }

  ngOnInit(): void {
    this.refreshOrganizations(0, this.ITEMS_PER_PAGE);
    this.activeOrgRoleService.activeOrganizationRole.subscribe(_ => this.updateOrgaRepresentation());
  }

  checkRepresentant(organization: IOrganizationData): string {
    if (organization.activeRepresentant) {
      return " - Aktiver Repräsentant";
    } else if (organization.passiveRepresentant) {
      return " - Passiver Repräsentant";
    } else {
      return "";
    }
  }

  protected refreshOrganizations(page: number, size: number) {
    this.organizationsApiService.fetchOrganizations(page, size).then(result => {
      this.activeOrganizationsPage.next(result);
      this.updateOrgaRepresentation();
    }).finally(() => {
      this.initialLoading = false;
    });
  }

  protected canEditOrganization(orga: IOrganizationData): boolean {
    return this.activeOrgRoleService.isActiveAsFedAdmin() // must be fed admin
    && (this.activeOrgRoleService.getActiveOrgaId() !== getParticipantIdFromParticipantSd(orga.selfDescription)); // must not be the orga of the fed admin
  }

  protected editOrganization(orga: IOrganizationData) {
    this.router.navigate(["organization/edit/", getParticipantIdFromParticipantSd(orga.selfDescription)]);
  }

  protected getConnectorBucketsString(cd: ConnectorData) {
    return cd.ionosS3ExtensionConfig.buckets.map(b => b.name).join(", ");
  }

  protected handleEventDetailsModal(modalVisible: boolean) {
    this.showingModal = modalVisible;
  }

  protected async requestDetails(id: string) {
    this.selectedOrganisationDetails = null;
    await this.organizationsApiService.getOrgaById(id).then(result => {
      this.selectedOrganisationDetails = result;
    });
  }

  toggleJsonView() {
    this.jsonViewHidden = !this.jsonViewHidden;
  }

  hideJsonView() {
    this.jsonViewHidden = true;
  }
}

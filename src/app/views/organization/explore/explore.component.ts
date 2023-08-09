import { Component, OnInit } from '@angular/core';
import { ConnectorData, IOrganizationData } from "../organization-data";
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  readonly ITEMS_PER_PAGE = 9;

  public organizations: IOrganizationData[] = [];

  public connectorInfo: ConnectorData[] = [];

  constructor(
    private organizationsApiService: OrganizationsApiService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.organizationsApiService.fetchOrganizations(0, this.ITEMS_PER_PAGE).then(result => {
      this.organizations = result.content

      for(let orga of this.organizations) {
        if(orga.activeRepresentant) {
          this.organizationsApiService.getConnectorsOfOrganization(orga.id.replace('Participant:', '')).then(value => {
            this.connectorInfo = value;
          });
        }
      }

    });
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
}

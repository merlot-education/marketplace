import { Component, OnInit } from '@angular/core';
import { ConnectorData, IOrganizationData } from "../organization-data";
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  readonly ITEMS_PER_PAGE = 999;

  public organizations: IOrganizationData[] = [];

  public connectorInfo: ConnectorData[] = [];

  constructor(
    private organizationsApiService: OrganizationsApiService,
    private authService: AuthService
  ) {}

  private updateOrgaRepresentation() {
    let representedOrgaIds = Object.values(this.authService.organizationRoles).map(orga => orga.orgaData.id);
    for(let orga of this.organizations) {
      if (orga.id === this.authService.activeOrganizationRole.value.orgaData.id) {
        orga.activeRepresentant = true;
        orga.passiveRepresentant = true;
      } else if (representedOrgaIds.includes(orga.id)) {
        orga.activeRepresentant = false;
        orga.passiveRepresentant = true;
      }

      if(orga.activeRepresentant) {
        this.organizationsApiService.getConnectorsOfOrganization(orga.id).then(value => {
          this.connectorInfo = value;
        });
      }
    }
  }

  ngOnInit(): void {
    this.organizationsApiService.fetchOrganizations(0, this.ITEMS_PER_PAGE).then(result => {
      this.organizations = result.content

      this.updateOrgaRepresentation();
    });
    this.authService.activeOrganizationRole.subscribe(_ => this.updateOrgaRepresentation());
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

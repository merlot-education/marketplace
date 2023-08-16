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
    for(let orga of this.organizations) {
      let orgaNumId = orga.id.replace('Participant:', '');
      if (orgaNumId === this.authService.activeOrganizationRole.value.orgaId) {
        orga.activeRepresentant = true;
        orga.passiveRepresentant = true;
      } else if (orgaNumId in this.authService.organizationRoles) {
        orga.activeRepresentant = false;
        orga.passiveRepresentant = true;
      }

      if(orga.activeRepresentant) {
        this.organizationsApiService.getConnectorsOfOrganization(orga.id.replace('Participant:', '')).then(value => {
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

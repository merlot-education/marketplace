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
    });
  }

  protected editOrganization(orga: IOrganizationData) {
    this.router.navigate(["organization/edit/", getParticipantIdFromParticipantSd(orga.selfDescription)]);
  }

  protected getConnectorBucketsString(cd: ConnectorData) {
    return cd.ionosS3ExtensionConfig.buckets.map(b => b.name).join(", ");
  }
}

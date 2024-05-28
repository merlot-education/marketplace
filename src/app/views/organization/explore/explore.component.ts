import { Component, OnInit } from '@angular/core';
import { ConnectorData, ICredentialSubject, ILegalParticipantCs, ILegalRegistrationNumberCs, IMerlotLegalParticipantCs, IOrganizationData, IPageOrganizations, IVerifiablePresentation } from "../organization-data";
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { SdDownloadService } from 'src/app/services/sd-download.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


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

  constructor(
    private organizationsApiService: OrganizationsApiService,
    protected authService: AuthService,
    protected activeOrgRoleService: ActiveOrganizationRoleService,
    protected sdDownloadService: SdDownloadService,
    private router: Router
  ) { }

  private updateOrgaRepresentation() {
    if (this.activeOrgRoleService.isLoggedIn.value) {
      let representedOrgaIds = Object.values(this.activeOrgRoleService.organizationRoles).filter(orga => orga.roleName === "OrgLegRep").map(orga => orga.orgaData.selfDescription.id);
      let administratedOrgaIds = Object.values(this.activeOrgRoleService.organizationRoles).filter(orga => orga.roleName === "FedAdmin").map(orga => orga.orgaData.selfDescription.id);
      
      for (let orga of this.activeOrganizationsPage.value.content) {
        if (this.activeOrgRoleService.isActiveAsRepresentative()) {
          orga.activeFedAdmin = false;
          orga.passiveFedAdmin = false;

          if (orga.selfDescription.id === this.activeOrgRoleService.getActiveOrgaId()) {
            orga.activeRepresentant = true;
            orga.passiveRepresentant = true;
          } else if (representedOrgaIds.includes(orga.selfDescription.id)) {
            orga.activeRepresentant = false;
            orga.passiveRepresentant = true;
          }

          if (orga.activeRepresentant) {
              this.connectorInfo = orga.metadata.connectors;
          }
        } else if (this.activeOrgRoleService.isActiveAsFedAdmin()) {
          orga.activeRepresentant = false;
          orga.passiveRepresentant = false;

          if (orga.selfDescription.id === this.activeOrgRoleService.getActiveOrgaId()) {
            orga.activeFedAdmin = true;
            orga.passiveFedAdmin = true;
          } else if (administratedOrgaIds.includes(orga.selfDescription.id)) {
            orga.activeFedAdmin = false;
            orga.passiveFedAdmin = true;
          }
        }
      }
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
    this.router.navigate(["organization/edit/", orga.selfDescription.id]);
  }

  protected getConnectorBucketsString(cd: ConnectorData) {
    return cd.ionosS3ExtensionConfig.buckets.map(b => b.name).join(", ");
  }

  protected getOrganizationName(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
      if (this.isLegalParticipantCs(vc.credentialSubject)) {
        return this.asLegalParticipantCs(vc.credentialSubject)['gx:name'];
      }
    }
    return "Unknown";
  }

  protected isLegalParticipantCs(cs: ICredentialSubject): boolean {
    return cs.type === "gx:LegalParticipant";
  }

  protected asLegalParticipantCs(cs: ICredentialSubject): ILegalParticipantCs {
    return cs as ILegalParticipantCs;
  }

  protected isLegalRegistrationNumberCs(cs: ICredentialSubject): boolean {
    return cs.type === "gx:legalRegistrationNumber";
  }

  protected asLegalRegistrationNumberCs(cs: ICredentialSubject): ILegalRegistrationNumberCs {
    return cs as ILegalRegistrationNumberCs;
  }

  protected isMerlotLegalParticipantCs(cs: ICredentialSubject): boolean {
    return cs.type === "merlot:MerlotLegalParticipant";
  }

  protected asMerlotLegalParticipantCs(cs: ICredentialSubject): IMerlotLegalParticipantCs {
    return cs as IMerlotLegalParticipantCs;
  }
}

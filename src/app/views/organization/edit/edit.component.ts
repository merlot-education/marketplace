import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ILegalRegistrationNumberCs, IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { OrganisationWizardExtensionComponent } from 'src/app/wizard-extension/organisation-wizard-extension/organisation-wizard-extension.component';
import { SdDownloadService } from 'src/app/services/sd-download.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

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
            this.selectOrganization(orga.orgaData.selfDescription.id);
      });
    }
    this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
      this.authService.refreshActiveRoleOrgaData();
      this.refreshSelectedOrganization(this.selectedOrganization.selfDescription.id)
    });
  }

  ngOnInit(): void {
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
        this.selectedOrganization.selfDescription.id).then(_ => {
          this.wizardExtensionComponent.prefillOrganisation(result);
        });
    });
  }
}

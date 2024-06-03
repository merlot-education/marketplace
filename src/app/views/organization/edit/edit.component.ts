import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ILegalRegistrationNumberCs, IOrganizationData } from "../organization-data";
import { AuthService } from 'src/app/services/auth.service';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { ActivatedRoute } from '@angular/router';
import { OrganisationWizardExtensionComponent } from 'src/app/wizard-extension/organisation-wizard-extension/organisation-wizard-extension.component';
import { SdDownloadService } from 'src/app/services/sd-download.service';
import { getParticipantIdFromParticipantSd } from 'src/app/utils/credential-tools';
import { takeUntil, takeWhile } from 'rxjs';

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
            this.selectOrganization(getParticipantIdFromParticipantSd(orga.orgaData.selfDescription));
      });
    }
    this.wizardExtensionComponent.submitCompleteEvent.subscribe(_ => {
      this.authService.refreshActiveRoleOrgaData();
      this.refreshSelectedOrganization(getParticipantIdFromParticipantSd(this.selectedOrganization.selfDescription))
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
        getParticipantIdFromParticipantSd(this.selectedOrganization.selfDescription)).then(_ => {
          this.wizardExtensionComponent.prefillDone
          .pipe(
            takeWhile(done => !done, true)
            )
          .subscribe(done => {
            console.log("wizard done: ", done);
            window.scrollTo(0,document.body.scrollHeight);
          });
          this.wizardExtensionComponent.prefillOrganisation(result);
        });
    });
  }
}

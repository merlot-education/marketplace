import { Component, EventEmitter, ViewChild } from '@angular/core';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { AbstractControl } from '@angular/forms';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { IOrganizationData } from 'src/app/views/organization/organization-data';
import { ModalComponent } from '@coreui/angular';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';


@Component({
  selector: 'app-organisation-wizard-extension',
  templateUrl: './organisation-wizard-extension.component.html',
  styleUrls: ['./organisation-wizard-extension.component.scss']
})
export class OrganisationWizardExtensionComponent {
  @ViewChild("baseWizardExtension") protected baseWizardExtension: BaseWizardExtensionComponent;

  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;
  protected submitButtonsDisabled: boolean = false;
  protected orgaIdFields: AbstractControl[] = [];
  submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  public selectedMembershipClass: string | null = null;

  public mailAddress: string | null = null;

  public orgaActive: string = "true";

  public orgaActiveInitial: string = "true";

  @ViewChild('modalConfirmation') private modalConfirmation: ModalComponent;

  constructor(
      protected organizationsApiService: OrganizationsApiService,
      protected activeOrgRoleService: ActiveOrganizationRoleService
    ) {}

  public async loadShape(shapeName: string, id: string): Promise<void> {
    await this.baseWizardExtension.loadShape(shapeName, id);
  }

  public isShapeLoaded(): boolean {
    return this.baseWizardExtension?.isShapeLoaded();
  }

  public prefillOrganisation(orga: IOrganizationData) {
    orga.metadata.active = "true"; // todo remove once this is sent from backend
    this.selectedMembershipClass = orga.metadata.membershipClass;
    this.mailAddress = orga.metadata.mailAddress;
    this.orgaActive = orga.metadata.active;
    this.orgaActiveInitial = orga.metadata.active;
    this.prefillFields(orga.selfDescription.verifiableCredential.credentialSubject);
  }

  public prefillFields(selfDescriptionFields: any) {
    this.baseWizardExtension.prefillFields(selfDescriptionFields);
  }

  private async saveSelfDescription(jsonSd: any) {
    const editedOrganisationData : IOrganizationData = {
      id: jsonSd["@id"],
      metadata: {
        orgaId: jsonSd["@id"],
        mailAddress: this.mailAddress,
        membershipClass: this.selectedMembershipClass,
        active: this.orgaActive
      },
      selfDescription: {
        verifiableCredential: {
          credentialSubject: jsonSd,
        },
      },
      activeRepresentant: false,
      passiveRepresentant: false,
      activeFedAdmin: false,
      passiveFedAdmin: false
    };
    
    this.orgaActiveInitial = this.orgaActive;

    return await this.organizationsApiService.saveOrganization(editedOrganisationData);
  }

  protected checkConfirmationNeeded() {
    if (this.orgaActiveInitial === "true" && this.orgaActive === "false") {
      this.modalConfirmation.visible = true;
    } else {
      this.onSubmit();
    }
  }

  protected onSubmit(): void {
    console.log("onSubmit");
    this.submitButtonsDisabled = true;
    this.saveStatusMessage.hideAllMessages();

    let jsonSd = this.baseWizardExtension.generateJsonSd();

    this.saveSelfDescription(jsonSd).then(result => {
      console.log(result);
      this.baseWizardExtension.setCredentialId(result["id"]);
      this.saveStatusMessage.showSuccessMessage("ID: " + result["id"]);
      this.submitCompleteEvent.emit(null);
    }).catch((e: HttpErrorResponse) => {
      this.saveStatusMessage.showErrorMessage(e.error.message);
    })
    .catch(_ => {
      this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
    }).finally(() => {
      this.submitButtonsDisabled = false;
    });
  }

  public ngOnDestroy() {
    this.baseWizardExtension.ngOnDestroy();
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }

  public isOrganizationMetadataFilled(): boolean {
    let membershipClassOk = this.isMembershipClassFilled();
    let mailAddressOk = this.isMailAddressFilled();

    return membershipClassOk && mailAddressOk;
  }

  public isMailAddressFilled(): boolean {
    return this.mailAddress !== null && this.mailAddress.trim().length !== 0;
  }

  public isMembershipClassFilled(): boolean {
    return this.selectedMembershipClass !== null && this.selectedMembershipClass.trim().length !== 0;
  }

  protected isWizardFormInvalid(): boolean {
    return this.baseWizardExtension?.isWizardFormInvalid();
  }
}

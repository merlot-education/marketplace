import { Component, EventEmitter, ViewChild } from '@angular/core';
import { ServiceofferingApiService } from '../../services/serviceoffering-api.service';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { ModalComponent } from '@coreui/angular';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';


@Component({
  selector: 'app-offering-wizard-extension',
  templateUrl: './offering-wizard-extension.component.html',
  styleUrls: ['./offering-wizard-extension.component.scss']
})
export class OfferingWizardExtensionComponent {
  @ViewChild("baseWizardExtension") protected baseWizardExtension: BaseWizardExtensionComponent;
  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;
  protected submitButtonsDisabled: boolean = false;
  submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('modalConfirmation') modalConfirmation: ModalComponent;

  constructor(
      private serviceofferingApiService: ServiceofferingApiService,
      protected activeOrgRoleService: ActiveOrganizationRoleService
    ) {}


  public async loadShape(shapeName: string, id: string): Promise<void> {
    console.log("Loading shape", shapeName);
    await this.baseWizardExtension.loadShape(this.serviceofferingApiService.fetchShape(shapeName), id);
  }

  public isShapeLoaded(): boolean {
    return this.baseWizardExtension?.isShapeLoaded();
  }

  public prefillFields(selfDescriptionFields: any) {
    this.baseWizardExtension.prefillFields(selfDescriptionFields);
  }

  private async saveSelfDescription(jsonSd: any) {
    return await this.serviceofferingApiService.createServiceOffering(JSON.stringify(jsonSd, null, 2), jsonSd["@type"]);
  }

  protected onSubmit(publishAfterSave: boolean): void {
    console.log("onSubmit");
    this.submitButtonsDisabled = true;
    this.saveStatusMessage.hideAllMessages();

    // for fields that contain the id of the creator organization, set them to the actual id
    for (let control of this.baseWizardExtension.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaId());
    }

    let jsonSd = this.baseWizardExtension.generateJsonSd();

    // revert the actual id to the orga for user readibility
    for (let control of this.baseWizardExtension.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaLegalName());
    }

    this.saveSelfDescription(jsonSd).then(result => {
      console.log(result);
      this.baseWizardExtension.setCredentialId(result["id"]);
      this.saveStatusMessage.showSuccessMessage("ID: " + result["id"]);

      if (publishAfterSave) {
        this.serviceofferingApiService.releaseServiceOffering(result["id"])
        .then(_ => {
          this.submitCompleteEvent.emit(null);
        })
        .catch((e: HttpErrorResponse) => {
          this.saveStatusMessage.showErrorMessage(e.error.message);
          this.submitButtonsDisabled = false;
        })
        .catch(_ => {
          this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
          this.submitButtonsDisabled = false;
        });
      } else {
        this.submitCompleteEvent.emit(null);
      }
    }).catch((e: HttpErrorResponse) => {
      this.saveStatusMessage.showErrorMessage(e.error.message);
      this.submitButtonsDisabled = false;
    })
    .catch(_ => {
      this.saveStatusMessage.showErrorMessage("Unbekannter Fehler");
      this.submitButtonsDisabled = false;
    }).finally(() => {
      if (!publishAfterSave) {
        this.submitButtonsDisabled = false;
      }
    });
  }

  public ngOnDestroy() {
    this.baseWizardExtension.ngOnDestroy();
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }

  protected isWizardFormInvalid(): boolean {
    return this.baseWizardExtension?.isWizardFormInvalid();
  }
}

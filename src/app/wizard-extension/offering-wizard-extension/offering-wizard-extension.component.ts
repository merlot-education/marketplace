import { Component, EventEmitter, ViewChild } from '@angular/core';
import { ServiceofferingApiService } from '../../services/serviceoffering-api.service';
import { StatusMessageComponent } from '../../views/common-views/status-message/status-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActiveOrganizationRoleService } from 'src/app/services/active-organization-role.service';
import { BaseWizardExtensionComponent } from '../base-wizard-extension/base-wizard-extension.component';
import { IServiceOffering } from 'src/app/views/serviceofferings/serviceofferings-data';
import { isGxServiceOfferingCs, isMerlotCoopContractServiceOfferingCs, isMerlotDataDeliveryServiceOfferingCs, isMerlotSaasServiceOfferingCs, isMerlotServiceOfferingCs } from 'src/app/utils/credential-tools';


@Component({
  selector: 'app-offering-wizard-extension',
  templateUrl: './offering-wizard-extension.component.html',
  styleUrls: ['./offering-wizard-extension.component.scss']
})
export class OfferingWizardExtensionComponent {
  @ViewChild("gxServiceOfferingWizard") private gxServiceOfferingWizard: BaseWizardExtensionComponent;
  @ViewChild("merlotServiceOfferingWizard") private merlotServiceOfferingWizard: BaseWizardExtensionComponent;
  @ViewChild("merlotSpecificServiceOfferingWizard") private merlotSpecificServiceOfferingWizard: BaseWizardExtensionComponent;

  @ViewChild("saveStatusMessage") private saveStatusMessage: StatusMessageComponent;

  public submitCompleteEvent: EventEmitter<any> = new EventEmitter();

  protected submitButtonsDisabled: boolean = false;

  constructor(
      private serviceofferingApiService: ServiceofferingApiService,
      protected activeOrgRoleService: ActiveOrganizationRoleService
    ) {}


  public async loadShape(shapeName: string, id: string): Promise<void> {
    console.log("Loading shape", shapeName);
    await this.gxServiceOfferingWizard.loadShape(this.serviceofferingApiService.getGxServiceOfferingShape(), id);
    await this.merlotServiceOfferingWizard.loadShape(this.serviceofferingApiService.getMerlotServiceOfferingShape(), id);
    await this.merlotSpecificServiceOfferingWizard.loadShape(this.serviceofferingApiService.getSpecificOfferingTypeShape(shapeName), id); // TODO
    //await this.baseWizardExtension.loadShape(this.serviceofferingApiService.fetchShape(shapeName), id);
  }

  public isShapeLoaded(): boolean {
    return this.gxServiceOfferingWizard?.isShapeLoaded() 
      && this.merlotServiceOfferingWizard?.isShapeLoaded() 
      && this.merlotSpecificServiceOfferingWizard?.isShapeLoaded();
  }

  public prefillFields(offering: any) {
    for (let vc of offering.selfDescription.verifiableCredential) {
      let cs = vc.credentialSubject;
      if (isGxServiceOfferingCs(cs)) {
        this.gxServiceOfferingWizard.prefillFields(cs, ["gx:providedBy"]);
      } else if (isMerlotServiceOfferingCs(cs)) {
        this.merlotServiceOfferingWizard.prefillFields(cs, []);
      } else if (isMerlotSaasServiceOfferingCs(cs) || isMerlotDataDeliveryServiceOfferingCs(cs) || isMerlotCoopContractServiceOfferingCs(cs)) {
        this.merlotSpecificServiceOfferingWizard.prefillFields(cs, []);
      }
    }
    //this.baseWizardExtension.prefillFields(selfDescriptionFields, ["TODO"]);
  }

  private async saveSelfDescription(jsonSd: any) {
    return await this.serviceofferingApiService.createServiceOffering(JSON.stringify(jsonSd, null, 2), jsonSd.type);
  }

  protected onSubmit(publishAfterSave: boolean): void {
    console.log("onSubmit");
    /*this.submitButtonsDisabled = true;
    this.saveStatusMessage.hideAllMessages();

    // for fields that contain the id of the creator organization, set them to the actual id
    for (let control of this.baseWizardExtension.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaId());
    }

    let jsonSd = this.baseWizardExtension.generateJsonCs();

    // revert the actual id to the orga for user readibility
    for (let control of this.baseWizardExtension.orgaIdFields) {
      control.patchValue(this.activeOrgRoleService.getActiveOrgaLegalName());
    }

    this.saveSelfDescription(jsonSd).then(result => {
      console.log("result", result);
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
    });*/
  }

  public ngOnDestroy() {
    this.gxServiceOfferingWizard.ngOnDestroy();
    this.merlotServiceOfferingWizard.ngOnDestroy();
    this.merlotSpecificServiceOfferingWizard.ngOnDestroy();
    this.saveStatusMessage.hideAllMessages();
    this.submitButtonsDisabled = false;
  }

  protected isWizardFormInvalid(): boolean {
    return this.gxServiceOfferingWizard?.isWizardFormInvalid() 
      && this.merlotServiceOfferingWizard?.isWizardFormInvalid() 
      && this.merlotSpecificServiceOfferingWizard?.isWizardFormInvalid();
  }
}

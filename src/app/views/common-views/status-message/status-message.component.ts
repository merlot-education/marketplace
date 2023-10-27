import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-message',
  templateUrl: './status-message.component.html',
  styleUrls: ['./status-message.component.scss']
})
export class StatusMessageComponent {

  private messageTimeout: NodeJS.Timeout = undefined;

  protected successMessageVisible: boolean = false;
  protected errorMessageVisible: boolean = false;
  protected infoMessageVisible: boolean = false;

  @Input() successMessage: string = "Test";
  @Input() errorMessage: string = "Test";
  @Input() infoMessage: string = "Test";

  protected successDetails: string = "";
  protected errorDetails: string = "";
  protected infoDetails: string = "";

  private startHideMessageTimeout(timeout: number) {
    if (timeout === undefined || timeout === 0) {
      return;
    }
    if (this.messageTimeout !== undefined) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = undefined;
    }
    this.messageTimeout = setTimeout(() => {
      this.hideAllMessages();
      this.messageTimeout = undefined;
    }, 5000);
  }

  public hideAllMessages() {
    if (this.messageTimeout !== undefined) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = undefined;
    }
    this.successMessageVisible = false;
    this.errorMessageVisible = false;
    this.infoMessageVisible = false;
    this.successDetails = "";
    this.errorDetails = "";
    this.infoDetails = "";
  }

  public showSuccessMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.successDetails = details;
    this.successMessageVisible = true;
    this.startHideMessageTimeout(timeout);
  }

  public showErrorMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.errorDetails = details;
    this.errorMessageVisible = true;
    this.startHideMessageTimeout(timeout);
  }

  public showInfoMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.infoDetails = details;
    this.infoMessageVisible = true;
    this.startHideMessageTimeout(timeout);
  }

}

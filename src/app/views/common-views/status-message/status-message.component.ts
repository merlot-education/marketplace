/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  public isMessageVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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
    this.isMessageVisible.next(false);
  }

  public showSuccessMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.successDetails = details;
    this.successMessageVisible = true;
    this.isMessageVisible.next(true);
    this.startHideMessageTimeout(timeout);
  }

  public showErrorMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.errorDetails = details;
    this.errorMessageVisible = true;
    this.isMessageVisible.next(true);
    this.startHideMessageTimeout(timeout);
  }

  public showInfoMessage(details: string = "", timeout: number = 0) {
    this.hideAllMessages();
    this.infoDetails = details;
    this.infoMessageVisible = true;
    this.isMessageVisible.next(true);
    this.startHideMessageTimeout(timeout);
  }

}

/*
 *  Copyright 2023-2024 Dataport AöR
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

import { Component } from '@angular/core';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { IOrganizationData } from '../organization/organization-data';
import { getOrganizationName } from 'src/app/utils/credential-tools';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  public sortedFederatorsList: string[] = [];

  private federatorMailMap: Map<string, string> = new Map<string, string>();

  public selectedFederator: string = null;
  protected environment = environment;

  constructor(
    private organizationsApiService: OrganizationsApiService
  ) { }

  ngOnInit(): void {
    this.refreshFederators();
  }

  protected refreshFederators() {
    this.organizationsApiService.fetchFederators().then(result => {
      this.federatorMailMap = this.getFederatorMap(result);
      this.sortedFederatorsList = this.getListOfFederatorNames(this.federatorMailMap).sort(this.sortAlphabetically);
    });
  }

  private sortAlphabetically(a: string, b:string){
    return a.localeCompare(b, 'de', {sensitivity: 'base'});
  }

  private getListOfFederatorNames(federatorMap: Map<string, any>) {
    return Array.from(federatorMap.keys());
  }

  private getFederatorMap(federators: IOrganizationData[]) {
    let federatorMap: Map<string, string> = new Map<string, string>();
    for (let federator of federators) {
      let federatorName: string = getOrganizationName(federator.selfDescription);
      let federatorMail: string = federator.metadata.mailAddress;
      federatorMap.set(federatorName, federatorMail);
    }
    return federatorMap;
  }

  protected openMailApp() {
    const recipient = 'funktionspostfach@merlot.de';
    const cc: string = this.getCCForRegistrationMail();
    const subject = 'Registrierung im MERLOT Portal für Organisationen';
    const body = 'Bitte füllen Sie das im Knowledge Transfer Center heruntergeladene Formular aus und hängen es dieser Mail an.';

    const ccParam = cc.trim() === "" ? '' : `cc=${cc}&`;
    const mailtoURL = `mailto:${recipient}?${ccParam}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const mailAppWindow = window.open(mailtoURL, '_blank');

    if (mailAppWindow) {
      mailAppWindow.focus();
    } else {
      alert('Es konnte kein Mailprogramm geöffnet werden.');
    }
  }

  private getCCForRegistrationMail() {
    if (this.sortedFederatorsList.includes(this.selectedFederator)) {
      return this.federatorMailMap.get(this.selectedFederator);
    } else {
      return '';
    }
  }
}

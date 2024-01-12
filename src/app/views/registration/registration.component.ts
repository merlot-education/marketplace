import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { IOrganizationData } from '../organization/organization-data';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  public activeFederators: BehaviorSubject<IOrganizationData[]> = new BehaviorSubject([]);

  public sortedFederatorsList: string[] = [];

  private federatorMap: Map<string, IOrganizationData> = new Map<string, IOrganizationData>();

  public selectedFederator: string | null = null;

  constructor(
    private organizationsApiService: OrganizationsApiService
  ) { }

  ngOnInit(): void {
    this.refreshFederators();
  }

  protected refreshFederators() {
    this.organizationsApiService.fetchFederators().then(result => {
      this.activeFederators.next(result);
      this.federatorMap = this.getFederatorMap(this.activeFederators.value);
      this.sortedFederatorsList = this.getListOfFederatorNames(this.federatorMap).sort(this.sortAlphabetically);
    });
  }

  private sortAlphabetically(a: string, b:string){
    return a.localeCompare(b, 'de', {sensitivity: 'base'});
  }

  private getListOfFederatorNames(federatorMap: Map<string, any>) {
    return Array.from(federatorMap.keys());
  }

  private getFederatorMap(federators: IOrganizationData[]) {
    let federatorMap: Map<string, IOrganizationData> = new Map<string, IOrganizationData>();
    for (let federator of federators) {
      let federatorName: string = federator.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
      federatorMap.set(federatorName, federator);
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
    if (this.getListOfFederatorNames(this.federatorMap).includes(this.selectedFederator)) {
      return this.federatorMap.get(this.selectedFederator).metadata.mailAddress;
    } else {
      return '';
    }
  }
}

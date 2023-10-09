import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { IPageOrganizations } from '../organization/organization-data';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
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

  public sortedFederatorsList: string[] = [];

  private federatorMap: Map<string, any> = new Map<string, any>();

  public selectedFederator: string | null = null;

  constructor(
    private organizationsApiService: OrganizationsApiService
  ) { }

  ngOnInit(): void {
    this.refreshFederators(0, this.ITEMS_PER_PAGE);
  }

  protected refreshFederators(page: number, size: number) {
    this.organizationsApiService.fetchFederators(page, size).then(result => {
      this.activeOrganizationsPage.next(result);
      this.federatorMap = this.getFederatorMap(this.activeOrganizationsPage.value.content);
      this.sortedFederatorsList = this.getListOfFederatorNames(this.federatorMap).sort(this.sortAlphabetically);
    });
  }

  private sortAlphabetically(a: string, b:string){
    return a.localeCompare(b, 'de', {sensitivity: 'base'});
  }

  private getListOfFederatorNames(federatorMap: Map<string, any>) {
    return Array.from(federatorMap.keys());
  }

  private getFederatorMap(content: any) {
    let federatorMap: Map<string, any> = new Map<string, any>();
    for (let federator of content) {
      let federatorName: string = federator.selfDescription.verifiableCredential.credentialSubject['merlot:orgaName']['@value'];
      federatorMap.set(federatorName, federator);
    }
    return federatorMap;
  }

  protected openMailApp() {
    const recipient = 'funktionspostfach@merlot.de';
    const cc: string = this.getCCForRegistrationMail();
    const subject = 'Registrierung im MERLOT Portal für Organisationen';
    const body = 'Bitte füllen Sie  das im Knowledge Transfer Center heruntergeladene Formular aus und hängen es dieser Mail an.';

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
      return this.federatorMap.get(this.selectedFederator).selfDescription.verifiableCredential.credentialSubject['merlot:mailAddress']['@value']
    } else {
      return '';
    }
  }
}

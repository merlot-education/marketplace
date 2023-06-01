import { Component, OnInit } from '@angular/core';
import { demoContracts, IContract } from '../contracts-data';
import { OrganizationsApiService } from 'src/app/services/organizations-api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  contracts: IContract[] = demoContracts;

  protected friendlyStatusNames = {  // TODO update to contract stati
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  constructor(protected organizationsApiService: OrganizationsApiService,
    protected authService: AuthService) {
  }

  ngOnInit(): void {
  }

  protected resolveContractStatusFriendlyName(status: string) {
    return this.friendlyStatusNames[status] ? this.friendlyStatusNames[status] : "Unbekannt";
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { IContractBasic, IContractDetailed, IPageContracts } from '../views/contracts/contracts-data';

@Injectable({
  providedIn: 'root',
})
export class ContractApiService {

  private friendlyStatusNames = {  // TODO update to contract stati
    "IN_DRAFT": "In Bearbeitung",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  public async createNewContract(offeringId: string, consumerId: string): Promise<IContractDetailed> {
    return await lastValueFrom(this.http.post(environment.contract_api_url, {
      offeringId: offeringId,
      consumerId: consumerId
    })) as IContractDetailed;
  }

  public async getOrgaContracts(consumerId: string) {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "organization/" + consumerId)) as IPageContracts;
  }

  public resolveFriendlyStatusName(contractStatus: string) {
    return this.friendlyStatusNames[contractStatus] ? this.friendlyStatusNames[contractStatus] : "Unbekannt";
  }
}

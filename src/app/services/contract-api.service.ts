import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Observable, lastValueFrom } from 'rxjs';
import { IContract, IEdcIdResponse, IEdcNegotiationStatus, IEdcTransferStatus, IPageContracts } from '../views/contracts/contracts-data';

@Injectable({
  providedIn: 'root',
})
export class ContractApiService {

  private friendlyStatusNames = {
    "IN_DRAFT": "In Bearbeitung",
    "SIGNED_CONSUMER": "Vom Kunden unterschrieben",
    "RELEASED": "Veröffentlicht",
    "REVOKED": "Widerrufen",
    "DELETED": "Gelöscht",
    "ARCHIVED": "Archiviert"
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getActiveRoleHeaders() : HttpHeaders {
    return new HttpHeaders({'Active-Role' : this.authService.activeOrganizationRole.value.orgaRoleString });
  }

  public getAvailableStatusNames() {
    return Object.keys(this.friendlyStatusNames);
  }

  public async createNewContract(offeringId: string, consumerId: string): Promise<IContract> {
    return await lastValueFrom(this.http.post(environment.contract_api_url, {
      offeringId: offeringId,
      consumerId: consumerId
    }, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async regenerateContract(contractId: string): Promise<IContract> {
    return await lastValueFrom(this.http.post(environment.contract_api_url + "contract/regenerate/" + contractId, null, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async updateContract(contract: IContract): Promise<IContract> {
    return await lastValueFrom(this.http.put(environment.contract_api_url, contract, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async statusShiftContract(contractId: string, newStatus: string) {  
    let headers = this.getActiveRoleHeaders();

    let fullUrl = environment.contract_api_url + 'contract/status/' + contractId + '/' + newStatus;
    
    return await lastValueFrom(this.http.patch(fullUrl, null, {headers: headers})) as IContract;
  }

  public async getOrgaContracts(page: number, size: number, consumerId: string, statusFilter: string = undefined): Promise<IPageContracts> {
    let url = environment.contract_api_url + "organization/" + consumerId + "?page=" + page + "&size=" + size;
    if (statusFilter !== undefined) {
      url += "&status=" + statusFilter;
    }
    return await lastValueFrom(this.http.get(url)) as IPageContracts;
  }

  public async getContractDetails(contractId: string): Promise<IContract> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "contract/" + contractId, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async initiateEdcNegotiation(contractId: string): Promise<IEdcIdResponse> {
    return await lastValueFrom(this.http.post(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/start", null, {headers: this.getActiveRoleHeaders()})) as IEdcIdResponse;
  }

  public async getEdcNegotiationStatus(contractId: string, negotiationId: string): Promise<IEdcNegotiationStatus> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/" + negotiationId + "/status", {headers: this.getActiveRoleHeaders()})) as IEdcNegotiationStatus;
  }

  public async initiateEdcTransfer(contractId: string, negotiationId: string): Promise<IEdcIdResponse> {
    return await lastValueFrom(this.http.post(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/" + negotiationId + "/transfer/start", null, {headers: this.getActiveRoleHeaders()})) as IEdcIdResponse;
  }

  public async getEdcTransferStatus(contractId: string, transferId: string): Promise<IEdcTransferStatus> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "transfers/contract/" + contractId + "/transfer/" + transferId + "/status", {headers: this.getActiveRoleHeaders()})) as IEdcTransferStatus;
  }

  public async addAttachment(contractId: string, formData: FormData): Promise<IContract> {
    return await lastValueFrom(this.http.patch(
      environment.contract_api_url + "contract/" + contractId + "/attachment", formData, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async deleteAttachment(contractId: string, attachmentName: string): Promise<IContract> {
    return await lastValueFrom(this.http.delete(
      environment.contract_api_url + "contract/" + contractId + "/attachment/" + attachmentName, {headers: this.getActiveRoleHeaders()})) as IContract;
  }

  public async downloadAttachment(contractId: string, attachmentName: string): Promise<any> {
    return await lastValueFrom(this.http.get(environment.contract_api_url + "contract/" + contractId + "/attachment/" + attachmentName, 
    {headers: this.getActiveRoleHeaders(), responseType: 'blob'}));
  }

  public resolveFriendlyStatusName(contractStatus: string) {
    return this.friendlyStatusNames[contractStatus] ? this.friendlyStatusNames[contractStatus] : "Unbekannt";
  }
}

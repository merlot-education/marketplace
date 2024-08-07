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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  private patchOrgaId(id: string) : string {
    return id.replace("#", "%23");  // encode hashtag
  }

  public getAvailableStatusNames() {
    return Object.keys(this.friendlyStatusNames);
  }

  public async createNewContract(offeringId: string, consumerId: string): Promise<IContract> {
    return await lastValueFrom(this.http.post(environment.contract_api_url, {
      offeringId: offeringId,
      consumerId: consumerId
    })) as IContract;
  }

  public async regenerateContract(contractId: string): Promise<IContract> {
    return await lastValueFrom(this.http.post(environment.contract_api_url + "contract/regenerate/" + contractId, null)) as IContract;
  }

  public async updateContract(contract: IContract): Promise<IContract> {
    return await lastValueFrom(this.http.put(environment.contract_api_url, contract)) as IContract;
  }

  public async statusShiftContract(contractId: string, newStatus: string) {  

    let fullUrl = environment.contract_api_url + 'contract/status/' + contractId + '/' + newStatus;
    
    return await lastValueFrom(this.http.patch(fullUrl, null)) as IContract;
  }

  public async getOrgaContracts(page: number, size: number, consumerId: string, statusFilter: string = undefined): Promise<IPageContracts> {
    let url = environment.contract_api_url + "organization/" + this.patchOrgaId(consumerId) + "?page=" + page + "&size=" + size;
    if (statusFilter !== undefined) {
      url += "&status=" + statusFilter;
    }
    return await lastValueFrom(this.http.get(url)) as IPageContracts;
  }

  public async getContractDetails(contractId: string): Promise<IContract> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "contract/" + contractId)) as IContract;
  }

  public async initiateEdcNegotiation(contractId: string): Promise<IEdcIdResponse> {
    return await lastValueFrom(this.http.post(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/start", null)) as IEdcIdResponse;
  }

  public async getEdcNegotiationStatus(contractId: string, negotiationId: string): Promise<IEdcNegotiationStatus> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/" + negotiationId + "/status")) as IEdcNegotiationStatus;
  }

  public async initiateEdcTransfer(contractId: string, negotiationId: string): Promise<IEdcIdResponse> {
    return await lastValueFrom(this.http.post(
      environment.contract_api_url + "transfers/contract/" + contractId + "/negotiation/" + negotiationId + "/transfer/start", null)) as IEdcIdResponse;
  }

  public async getEdcTransferStatus(contractId: string, transferId: string): Promise<IEdcTransferStatus> {
    return await lastValueFrom(this.http.get(
      environment.contract_api_url + "transfers/contract/" + contractId + "/transfer/" + transferId + "/status")) as IEdcTransferStatus;
  }

  public async addAttachment(contractId: string, formData: FormData): Promise<IContract> {
    return await lastValueFrom(this.http.patch(
      environment.contract_api_url + "contract/" + contractId + "/attachment", formData)) as IContract;
  }

  public async deleteAttachment(contractId: string, attachmentName: string): Promise<IContract> {
    return await lastValueFrom(this.http.delete(
      environment.contract_api_url + "contract/" + contractId + "/attachment/" + attachmentName)) as IContract;
  }

  public async downloadAttachment(contractId: string, attachmentName: string): Promise<any> {
    return await lastValueFrom(this.http.get(environment.contract_api_url + "contract/" + contractId + "/attachment/" + attachmentName, 
    {responseType: 'blob'}));
  }

  public async downloadContractPdf(contractId: string): Promise<any> {
    return await lastValueFrom(this.http.get(environment.contract_api_url + "contract/" + contractId + "/contractPdf", 
    {responseType: 'blob'}));
  }

  public resolveFriendlyStatusName(contractStatus: string) {
    return this.friendlyStatusNames[contractStatus] ? this.friendlyStatusNames[contractStatus] : "Unbekannt";
  }
}

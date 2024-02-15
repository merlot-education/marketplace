import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConnectorData, IOrganizationData, IPageOrganizations } from '../views/organization/organization-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsApiService {

  private merlotFederationOrga: IOrganizationData = undefined;

  constructor(private http: HttpClient) {
    this.getOrgaById("did:web:" + environment.marketplace_url + "#df15587a-0760-32b5-9c42-bb7be66e8076").then(result => {
      this.merlotFederationOrga = result;
    });
  }

  public getMerlotFederationOrga() {
    return this.merlotFederationOrga;
  }

  private patchOrgaId(id: string) : string {
    return id.replace("#", "%23");  // encode hashtag
  }

  public async fetchOrganizations(page: number, size: number): Promise<IPageOrganizations> {
    console.log("fetching organizations");
    // fetch data and cast it into interface
    let orgaData = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "?page=" + page + "&size=" + size)
    )) as IPageOrganizations;
    return orgaData;
  }

  public async getOrgaById(id: string): Promise<IOrganizationData> {
    return await (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "organization/" + this.patchOrgaId(id))
    )) as IOrganizationData;
  }

  public async getMerlotParticipantShape(): Promise<any> {
    return await lastValueFrom(this.http.get(environment.organizations_api_url + "shapes/merlotParticipant"));
  }

  public async saveOrganization(sdJson: IOrganizationData) {
    console.log(sdJson);
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return await lastValueFrom(this.http.put(environment.organizations_api_url + "organization", sdJson, {headers: headers}));
  }

  public async fetchFederators(): Promise<IOrganizationData[]> {
    console.log("fetching federators");

    let federatorList = (await lastValueFrom(
      this.http.get(environment.organizations_api_url + "federators")
    )) as IOrganizationData[];
    return federatorList;
  }

  public async addOrganization(formData: FormData) {
    return await lastValueFrom(this.http.post(
      environment.organizations_api_url + "organization", formData)) as IOrganizationData;
  }
}

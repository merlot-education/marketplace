import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Utils} from '@shared/utils';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import Data from '../mock/form.mock.json';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private httpClient: HttpClient, public translate: TranslateService) {
  }

  getFieldContraints(acceptType: string = 'application/json'): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': acceptType
      })
    };
    return this.httpClient.get<any>(`${environment.wizard_api_url}/demo`);
  }

  // Can be used for development
  getFieldsFromFile() {
    return Data;
  }

  upload(file: File): Observable<any> {
    const apiUrl = Utils.controlUrl(environment.wizard_api_url);
    const data = new FormData();
    data.append('file', file);
    return this.httpClient.post(`${apiUrl}/convertFile`, data);
  }

  getFiles(): Observable<any> {
    const apiUrl = Utils.controlUrl(environment.wizard_api_url);
    return this.httpClient.get(`${apiUrl}/getAvailableShapes`);
  }
  getFilesCategorized(system): Observable<any> {
    const apiUrl = Utils.controlUrl(environment.wizard_api_url);
    return this.httpClient.get(`${apiUrl}/getAvailableShapesCategorized?ecoSystem=`+system);
  }

  getJSON(name: string): Observable<any> {
    const apiUrl = Utils.controlUrl(environment.wizard_api_url);
    const params = new HttpParams().set('name', name);
    //incase of choosing language through the link .set('lan',this.translate.currentLang)
   
    return this.httpClient.get(`${apiUrl}/getJSON`, {params});
  }
}

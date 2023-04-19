import { TestBed } from '@angular/core/testing';

import { AaamApiService } from './aaam-api.service';
import { HttpBackend, HttpClient, HttpHandler } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

describe('AaamApiService', () => {
  let service: AaamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler, KeycloakService, HttpBackend]
    });
    service = TestBed.inject(AaamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

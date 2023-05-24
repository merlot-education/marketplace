import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { KeycloakService } from 'keycloak-angular';
import { HttpBackend, HttpClient, HttpHandler } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService, HttpClient, HttpHandler, HttpBackend]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

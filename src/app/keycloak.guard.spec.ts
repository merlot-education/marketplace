import { TestBed } from '@angular/core/testing';

import { KeycloakGuard } from './keycloak.guard';
import { KeycloakService } from 'keycloak-angular';

describe('KeycloakGuard', () => {
  let guard: KeycloakGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService]
    });
    guard = TestBed.inject(KeycloakGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

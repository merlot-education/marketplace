import { TestBed } from '@angular/core/testing';

import { KeycloakGuard } from './keycloak.guard';

describe('KeycloakGuard', () => {
  let guard: KeycloakGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(KeycloakGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

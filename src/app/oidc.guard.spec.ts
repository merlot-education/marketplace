import { TestBed } from '@angular/core/testing';

import { OidcGuard } from './oidc.guard';

describe('OidcGuard', () => {
  let guard: OidcGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OidcGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

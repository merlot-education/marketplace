import { TestBed } from '@angular/core/testing';

import { OrganizationsApiService } from './organizations-api.service';

describe('OrganizationsApiService', () => {
  let service: OrganizationsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

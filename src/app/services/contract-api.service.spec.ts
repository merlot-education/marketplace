import { TestBed } from '@angular/core/testing';

import { ContractApiService } from './contract-api.service';

describe('ContractApiService', () => {
  let service: ContractApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AaamApiService } from './aaam-api.service';

describe('AaamApiService', () => {
  let service: AaamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AaamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

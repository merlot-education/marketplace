import { TestBed } from '@angular/core/testing';

import { ServiceofferingApiService } from './serviceoffering-api.service';

describe('ServiceofferingApiService', () => {
  let service: ServiceofferingApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceofferingApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

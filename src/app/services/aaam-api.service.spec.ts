import { TestBed } from '@angular/core/testing';

import { AaamApiService } from './aaam-api.service';
import { HttpBackend, HttpClient, HttpHandler } from '@angular/common/http';

describe('AaamApiService', () => {
  let service: AaamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler, HttpBackend]
    });
    service = TestBed.inject(AaamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

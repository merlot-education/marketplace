import { TestBed } from '@angular/core/testing';

import { SdDownloadService } from './sd-download.service';

describe('SdDownloadService', () => {
  let service: SdDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

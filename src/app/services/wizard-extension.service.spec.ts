import { TestBed } from '@angular/core/testing';

import { WizardExtensionService } from './wizard-extension.service';

describe('WizardExtensionServiceService', () => {
  let service: WizardExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

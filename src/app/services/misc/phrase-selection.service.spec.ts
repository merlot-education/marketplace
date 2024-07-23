import { TestBed } from '@angular/core/testing';

import { PhraseSelectionEasterEggService } from './phrase-selection-easter-egg.service';

describe('PhraseSelectionEasterEggService', () => {
  let service: PhraseSelectionEasterEggService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhraseSelectionEasterEggService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

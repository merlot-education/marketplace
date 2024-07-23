import { TestBed } from '@angular/core/testing';

import { WordSelectionEasterEggService } from './word-selection-easter-egg.service';

describe('WordSelectionEasterEggService', () => {
  let service: WordSelectionEasterEggService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordSelectionEasterEggService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

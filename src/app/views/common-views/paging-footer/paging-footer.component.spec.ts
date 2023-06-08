import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagingFooterComponent } from './paging-footer.component';

describe('PagingFooterComponent', () => {
  let component: PagingFooterComponent;
  let fixture: ComponentFixture<PagingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagingFooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

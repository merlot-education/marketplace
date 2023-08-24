import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferingdetailviewComponent } from './offeringdetailview.component';

describe('OfferingdetailviewComponent', () => {
  let component: OfferingdetailviewComponent;
  let fixture: ComponentFixture<OfferingdetailviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferingdetailviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferingdetailviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

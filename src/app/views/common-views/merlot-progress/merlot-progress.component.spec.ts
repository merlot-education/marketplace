import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerlotProgressComponent } from './merlot-progress.component';

describe('MerlotProgressComponent', () => {
  let component: MerlotProgressComponent;
  let fixture: ComponentFixture<MerlotProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerlotProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerlotProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

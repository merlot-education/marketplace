import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractviewComponent } from './contractview.component';

describe('ContractviewComponent', () => {
  let component: ContractviewComponent;
  let fixture: ComponentFixture<ContractviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

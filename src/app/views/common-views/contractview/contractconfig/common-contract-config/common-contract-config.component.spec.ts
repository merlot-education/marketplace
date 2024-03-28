import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonContractConfigComponent } from './common-contract-config.component';

describe('CommonContractConfigComponent', () => {
  let component: CommonContractConfigComponent;
  let fixture: ComponentFixture<CommonContractConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonContractConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonContractConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

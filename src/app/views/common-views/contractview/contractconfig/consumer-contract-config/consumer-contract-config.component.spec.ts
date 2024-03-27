import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerContractConfigComponent } from './consumer-contract-config.component';

describe('ConsumerContractConfigComponent', () => {
  let component: ConsumerContractConfigComponent;
  let fixture: ComponentFixture<ConsumerContractConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumerContractConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumerContractConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

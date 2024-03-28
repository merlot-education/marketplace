import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderContractConfigComponent } from './provider-contract-config.component';

describe('ProviderContractConfigComponent', () => {
  let component: ProviderContractConfigComponent;
  let fixture: ComponentFixture<ProviderContractConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderContractConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderContractConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

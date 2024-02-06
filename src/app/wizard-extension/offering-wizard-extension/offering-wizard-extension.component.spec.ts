import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferingWizardExtensionComponent } from './offering-wizard-extension.component';

describe('OfferingWizardExtensionComponent', () => {
  let component: OfferingWizardExtensionComponent;
  let fixture: ComponentFixture<OfferingWizardExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferingWizardExtensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferingWizardExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

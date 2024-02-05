import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationWizardExtensionComponent } from './organisation-wizard-extension.component';

describe('OrganisationWizardExtensionComponent', () => {
  let component: OrganisationWizardExtensionComponent;
  let fixture: ComponentFixture<OrganisationWizardExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganisationWizardExtensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationWizardExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

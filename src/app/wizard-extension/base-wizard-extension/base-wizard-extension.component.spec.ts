import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWizardExtensionComponent } from './base-wizard-extension.component';

describe('BaseWizardExtensionComponent', () => {
  let component: BaseWizardExtensionComponent;
  let fixture: ComponentFixture<BaseWizardExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseWizardExtensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseWizardExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

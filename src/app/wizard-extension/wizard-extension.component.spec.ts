import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardExtensionComponent } from './wizard-extension.component';

describe('WizardExtensionComponent', () => {
  let component: WizardExtensionComponent;
  let fixture: ComponentFixture<WizardExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WizardExtensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

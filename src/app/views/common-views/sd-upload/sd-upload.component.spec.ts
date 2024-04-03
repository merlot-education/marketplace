import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdUploadComponent } from './sd-upload.component';

describe('SdUploadComponent', () => {
  let component: SdUploadComponent;
  let fixture: ComponentFixture<SdUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

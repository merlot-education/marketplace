import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationIonosS3ConfigComponent } from './organisation-ionos-s3-config.component';

describe('OrganisationIonosS3ConfigComponent', () => {
  let component: OrganisationIonosS3ConfigComponent;
  let fixture: ComponentFixture<OrganisationIonosS3ConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganisationIonosS3ConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationIonosS3ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

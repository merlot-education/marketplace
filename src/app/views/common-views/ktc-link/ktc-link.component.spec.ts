import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KtcLinkComponent } from './ktc-link.component';

describe('KtcLinkComponent', () => {
  let component: KtcLinkComponent;
  let fixture: ComponentFixture<KtcLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KtcLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KtcLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

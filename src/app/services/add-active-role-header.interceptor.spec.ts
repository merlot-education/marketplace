import { TestBed } from '@angular/core/testing';

import { AddActiveRoleHeaderInterceptor } from './add-active-role-header.interceptor';

describe('AddActiveRoleHeaderInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AddActiveRoleHeaderInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AddActiveRoleHeaderInterceptor = TestBed.inject(AddActiveRoleHeaderInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ActiveNumService } from './active-num.service';

describe('ActiveNumService', () => {
  let service: ActiveNumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveNumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

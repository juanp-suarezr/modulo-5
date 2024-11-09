import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorAutenticationComponent } from './error-autentication.component';

describe('ErrorAutenticationComponent', () => {
  let component: ErrorAutenticationComponent;
  let fixture: ComponentFixture<ErrorAutenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAutenticationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorAutenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

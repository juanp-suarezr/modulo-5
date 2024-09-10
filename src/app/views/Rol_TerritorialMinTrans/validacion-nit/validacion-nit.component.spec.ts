import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacionNitComponent } from './validacion-nit.component';

describe('ValidacionNitComponent', () => {
  let component: ValidacionNitComponent;
  let fixture: ComponentFixture<ValidacionNitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacionNitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidacionNitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

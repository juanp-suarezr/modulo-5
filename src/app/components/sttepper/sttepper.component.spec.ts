import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SttepperComponent } from './sttepper.component';

describe('SttepperComponent', () => {
  let component: SttepperComponent;
  let fixture: ComponentFixture<SttepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SttepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SttepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

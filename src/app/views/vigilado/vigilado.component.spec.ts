import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VigiladoComponent } from './vigilado.component';

describe('VigiladoComponent', () => {
  let component: VigiladoComponent;
  let fixture: ComponentFixture<VigiladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VigiladoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VigiladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

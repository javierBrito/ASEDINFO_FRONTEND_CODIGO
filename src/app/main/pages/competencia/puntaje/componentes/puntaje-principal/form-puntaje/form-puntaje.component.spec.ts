import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPuntajeComponent } from './form-puntaje.component';

describe('FormPuntajeComponent', () => {
  let component: FormPuntajeComponent;
  let fixture: ComponentFixture<FormPuntajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormPuntajeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPuntajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTransaccionConsultaComponent } from './form-transaccion-consulta.component';

describe('FormTransaccionConsultaComponent', () => {
  let component: FormTransaccionConsultaComponent;
  let fixture: ComponentFixture<FormTransaccionConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormTransaccionConsultaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTransaccionConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

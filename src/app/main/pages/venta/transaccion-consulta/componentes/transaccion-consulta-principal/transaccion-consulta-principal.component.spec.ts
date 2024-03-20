import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionConsultaPrincipalComponent } from './transaccion-consulta-principal.component';

describe('TransaccionConsultaPrincipalComponent', () => {
  let component: TransaccionConsultaPrincipalComponent;
  let fixture: ComponentFixture<TransaccionConsultaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransaccionConsultaPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransaccionConsultaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

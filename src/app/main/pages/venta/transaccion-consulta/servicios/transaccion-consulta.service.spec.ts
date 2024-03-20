import { TestBed } from '@angular/core/testing';
import { TransaccionConsultaService } from './transaccion-consulta.service';

describe('TransaccionConsultaService', () => {
  let service: TransaccionConsultaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransaccionConsultaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

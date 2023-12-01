import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormParticipanteComponent } from './form-participante.component';

describe('FormParticipanteComponent', () => {
  let component: FormParticipanteComponent;
  let fixture: ComponentFixture<FormParticipanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormParticipanteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormParticipanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

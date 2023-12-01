import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantePrincipalComponent } from './participante-principal.component';

describe('ParticipantePrincipalComponent', () => {
  let component: ParticipantePrincipalComponent;
  let fixture: ComponentFixture<ParticipantePrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantePrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantePrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

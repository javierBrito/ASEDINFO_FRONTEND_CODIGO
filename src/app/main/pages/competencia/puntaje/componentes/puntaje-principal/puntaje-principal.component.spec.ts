import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntajePrincipalComponent } from './puntaje-principal.component';

describe('PuntajePrincipalComponent', () => {
  let component: PuntajePrincipalComponent;
  let fixture: ComponentFixture<PuntajePrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuntajePrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuntajePrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

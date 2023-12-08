import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoPrincipalComponent } from './resultado-principal.component';

describe('ResultadoPrincipalComponent', () => {
  let component: ResultadoPrincipalComponent;
  let fixture: ComponentFixture<ResultadoPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultadoPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultadoPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametroPrincipalComponent } from './parametro-principal.component';

describe('ParametroPrincipalComponent', () => {
  let component: ParametroPrincipalComponent;
  let fixture: ComponentFixture<ParametroPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametroPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametroPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

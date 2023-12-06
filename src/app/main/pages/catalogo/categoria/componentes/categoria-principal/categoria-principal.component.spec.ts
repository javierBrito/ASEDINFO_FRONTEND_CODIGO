import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaPrincipalComponent } from './categoria-principal.component';

describe('CategoriaPrincipalComponent', () => {
  let component: CategoriaPrincipalComponent;
  let fixture: ComponentFixture<CategoriaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoriaPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

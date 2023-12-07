import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoriaPrincipalComponent } from './subcategoria-principal.component';

describe('SubcategoriaPrincipalComponent', () => {
  let component: SubcategoriaPrincipalComponent;
  let fixture: ComponentFixture<SubcategoriaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcategoriaPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcategoriaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

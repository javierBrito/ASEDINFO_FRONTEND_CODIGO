import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSubcategoriaComponent } from './form-subcategoria.component';

describe('FormSubcategoriaComponent', () => {
  let component: FormSubcategoriaComponent;
  let fixture: ComponentFixture<FormSubcategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormSubcategoriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSubcategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

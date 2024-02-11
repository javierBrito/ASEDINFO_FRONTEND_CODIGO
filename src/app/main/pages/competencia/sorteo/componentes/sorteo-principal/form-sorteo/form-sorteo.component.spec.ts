import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSorteoComponent } from './form-sorteo.component';

describe('FormSorteoComponent', () => {
  let component: FormSorteoComponent;
  let fixture: ComponentFixture<FormSorteoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormSorteoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSorteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormParametroComponent } from './form-parametro.component';

describe('FormParametroComponent', () => {
  let component: FormParametroComponent;
  let fixture: ComponentFixture<FormParametroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormParametroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

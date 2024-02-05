import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoPrincipalComponent } from './estado-principal.component';

describe('EstadoPrincipalComponent', () => {
  let component: EstadoPrincipalComponent;
  let fixture: ComponentFixture<EstadoPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadoPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

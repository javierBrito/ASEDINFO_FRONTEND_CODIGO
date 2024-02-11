import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SorteoPrincipalComponent } from './sorteo-principal.component';

describe('SorteoPrincipalComponent', () => {
  let component: SorteoPrincipalComponent;
  let fixture: ComponentFixture<SorteoPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SorteoPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SorteoPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

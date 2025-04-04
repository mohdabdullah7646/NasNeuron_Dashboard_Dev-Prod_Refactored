import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NONPBMComponent } from './non-pbm.component';

describe('NONPBMComponent', () => {
  let component: NONPBMComponent;
  let fixture: ComponentFixture<NONPBMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NONPBMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NONPBMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PBMComponent } from './pbm.component';

describe('PBMComponent', () => {
  let component: PBMComponent;
  let fixture: ComponentFixture<PBMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PBMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PBMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

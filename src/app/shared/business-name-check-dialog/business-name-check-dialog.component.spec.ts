import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessNameCheckDialogComponent } from './business-name-check-dialog.component';

describe('BusinessNameCheckDialogComponent', () => {
  let component: BusinessNameCheckDialogComponent;
  let fixture: ComponentFixture<BusinessNameCheckDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessNameCheckDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessNameCheckDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

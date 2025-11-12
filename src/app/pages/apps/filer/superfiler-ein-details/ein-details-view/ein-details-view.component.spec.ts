import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EinDetailsViewComponent } from './ein-details-view.component';

describe('EinDetailsViewComponent', () => {
  let component: EinDetailsViewComponent;
  let fixture: ComponentFixture<EinDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EinDetailsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EinDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

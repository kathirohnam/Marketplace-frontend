import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EinDetailsListComponent } from './ein-details-list.component';

describe('EinDetailsListComponent', () => {
  let component: EinDetailsListComponent;
  let fixture: ComponentFixture<EinDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EinDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EinDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

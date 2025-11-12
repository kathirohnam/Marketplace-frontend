import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTopicModalComponent } from './create-topic-modal.component';

describe('CreateTopicModalComponent', () => {
  let component: CreateTopicModalComponent;
  let fixture: ComponentFixture<CreateTopicModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTopicModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTopicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

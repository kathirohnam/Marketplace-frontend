import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumHeaderComponent } from './forum-header.component';

describe('ForumHeaderComponent', () => {
  let component: ForumHeaderComponent;
  let fixture: ComponentFixture<ForumHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

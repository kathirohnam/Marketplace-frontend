import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumTopicDto } from 'src/app/models/forum-backend';
import { ForumService } from 'src/app/services/forum.service'; // Adjust path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-filter">
      <div class="category-scroll">
        <button
          class="category-chip"
          [class.active]="selectedCategory === null"
          (click)="selectCategory(null)"
        >
          All Topics
        </button>
        <button
          *ngFor="let topic of availableTopics"
          class="category-chip"
          [class.active]="selectedCategory === topic.topicName"
          (click)="selectCategory(topic.topicName)"
        >
          {{ topic.topicName }}
        </button>
      </div>
    </div>
  `,
  // Styles remain the same as provided in the original file
  styles: [`
    .category-filter {
      margin-bottom: 1.5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .category-filter::-webkit-scrollbar {
      display: none;
    }

    .category-scroll {
      display: flex;
      gap: 0.5rem;
      min-width: min-content;
    }

    .category-chip {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-chip:hover {
      border-color: #2563eb;
      color: #2563eb;
      background: #eff6ff;
    }

    .category-chip.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    @media (max-width: 640px) {
      .category-filter {
        margin-left: -1rem;
        margin-right: -1rem;
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class CategoryFilterComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string | null>();

  availableTopics: ForumTopicDto[] = [];
  selectedCategory: string | null = null;
  private topicSubscription: Subscription | null = null;

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    // Subscribe to available topics from the service
    this.topicSubscription = this.forumService.availableTopics$.subscribe(topics => {
        // Filter out duplicates if backend returns raw list including General multiple times
        const uniqueTopics = topics.reduce((acc, current) => {
            const x = acc.find(item => item.topicName === current.topicName);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, [] as ForumTopicDto[]);
       this.availableTopics = uniqueTopics;
    });
     // Initial fetch if needed, though service constructor might handle it
     this.forumService.fetchAvailableTopics();
  }

   ngOnDestroy(): void {
    this.topicSubscription?.unsubscribe();
  }


  selectCategory(categoryName: string | null): void {
    this.selectedCategory = categoryName;
    this.categorySelected.emit(categoryName); // Emit the selected category name
  }
}
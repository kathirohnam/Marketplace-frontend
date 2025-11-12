import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Topic, User } from 'src/app/models/forum.model'; // Adjust path
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Add MatIconModule
  template: `
  <div class="cardWithShadow">
    <div class="p-24">
      <div class="topics-list">
        <div
          *ngFor="let topic of topics"
          class="topic-card"
          (click)="onTopicClick(topic)"
        >
          <div class="topic-header">
            <div class="topic-badge-group">
              <span class="category-badge" [attr.data-category]="topic.category">
                {{ topic.category }}
              </span>
              <span *ngIf="topic.isPinned" class="pinned-badge">
                 <mat-icon>push_pin</mat-icon>
                Pinned
              </span>
            </div>
          </div>

          <h2 class="topic-title">{{ topic.title }}</h2>

          <p class="topic-preview">{{ topic.preview }}</p>

          <div class="topic-footer">
            <div class="author-info">
              <img [src]="topic.author.avatar" [alt]="topic.author.name" class="avatar">
              <span class="author-name">{{ topic.author.name }}</span>
            </div>

            <div class="topic-meta">
              <div class="meta-item">
                 <mat-icon>forum</mat-icon>
                <span>{{ topic.replyCount }}</span>
              </div>
              <div class="meta-item">
                 <mat-icon>visibility</mat-icon>
                <span>{{ topic.viewCount }}</span>
              </div>
              <div class="meta-item time">
                 <mat-icon>schedule</mat-icon>
                <span>{{ getTimeAgo(topic.lastActivity) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="topics && topics.length === 0" class="empty-state">
           <mat-icon>search_off</mat-icon> <h3>No topics found</h3>
          <p>Try adjusting your search or filters, or create a new topic!</p>
        </div>
      </div>
    </div>
  </div>
  `,
  // Styles remain the same as provided in the original file
  styles: [`
     .cardWithShadow { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
    .p-24 { padding: 1.5rem; }
    .topics-list { display: flex; flex-direction: column; gap: 1rem; }
    .topic-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; transition: all 0.2s; }
    .topic-card:hover { border-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
    .topic-header { margin-bottom: 0.75rem; }
    .topic-badge-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .category-badge { padding: 0.25rem 0.625rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; background: #eff6ff; color: #2563eb; }
    .category-badge[data-category="Tax & Legal"] { background: #fef3c7; color: #d97706; }
    .category-badge[data-category="Business Growth"] { background: #d1fae5; color: #059669; }
    .category-badge[data-category="Success Stories"] { background: #fce7f3; color: #db2777; }
    .category-badge[data-category="LLC Formation"] { background: #ede9fe; color: #7c3aed; }
     .category-badge[data-category="General"] { background: #f3f4f6; color: #4b5563; } /* Added General style */
    .pinned-badge { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; background: #fef3c7; color: #d97706; }
     .pinned-badge mat-icon { font-size: 14px; width: 14px; height: 14px; } /* Style for mat-icon */
    .topic-title { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0 0 0.5rem 0; line-height: 1.4; }
    .topic-preview { color: #6b7280; font-size: 0.9375rem; line-height: 1.5; margin: 0 0 1rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .topic-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
    .author-info { display: flex; align-items: center; gap: 0.5rem; }
    .avatar { width: 2rem; height: 2rem; border-radius: 9999px; background: #e5e7eb; object-fit: cover; } /* Added object-fit */
    .author-name { font-size: 0.875rem; font-weight: 500; color: #1f2937; }
    .topic-meta { display: flex; align-items: center; gap: 1rem; }
    .meta-item { display: flex; align-items: center; gap: 0.25rem; color: #9ca3af; font-size: 0.875rem; }
     .meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; } /* Style for mat-icon */
    .meta-item.time { display: none; } /* Hide time by default on smaller screens */
    .empty-state { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
     .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin: 0 auto 1rem; } /* Style for mat-icon */
    .empty-state h3 { font-size: 1.125rem; color: #6b7280; margin: 0 0 0.5rem 0; }
    .empty-state p { margin: 0; font-size: 0.9375rem; }
     @media (min-width: 640px) { .meta-item.time { display: flex; } } /* Show time on larger screens */
     @media (max-width: 768px) { .p-24 { padding: 1.25rem; } .topic-card { padding: 1.125rem; } }
     @media (max-width: 640px) { .p-24 { padding: 1rem; } .topic-card { padding: 1rem; } .topic-title { font-size: 1rem; } .topic-preview { font-size: 0.875rem; } .topic-footer { flex-direction: column; align-items: flex-start; gap: 0.75rem; } .author-info { width: 100%; } .topic-meta { width: 100%; justify-content: flex-start; gap: 0.75rem; } }
  `]
})
export class TopicsListComponent {
  @Input() topics: Topic[] = [];
  @Output() topicSelected = new EventEmitter<Topic>();

  onTopicClick(topic: Topic): void {
    this.topicSelected.emit(topic);
  }

  getTimeAgo(dateInput: Date | string | undefined): string {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
     if (isNaN(date.getTime())) return ''; // Invalid date check

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }
}
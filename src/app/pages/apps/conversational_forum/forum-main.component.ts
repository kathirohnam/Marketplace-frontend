import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ForumHeaderComponent } from './forum-header/forum-header.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { TopicsListComponent } from './topics-list/topics-list.component';
import { TopicDetailComponent } from './topic-detail/topic-detail.component';
import { CreateTopicModalComponent } from './create-topic-modal/create-topic-modal.component';
import { NotificationsPanelComponent } from './notifications-panel/notifications-panel.component';
import { ForumService } from 'src/app/services/forum.service'; // Adjust path
import { Topic, TopicDetail, Post } from 'src/app/models/forum.model'; // Adjust path
import { MaterialModule } from 'src/app/material.module'; // Adjust path

@Component({
  selector: 'app-forum-main',
  standalone: true,
  imports: [
    CommonModule, ForumHeaderComponent, SearchBarComponent, CategoryFilterComponent,
    TopicsListComponent, TopicDetailComponent, CreateTopicModalComponent, MaterialModule,
    NotificationsPanelComponent
  ],
   template: `
   <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <div class="forum-container">
          <app-forum-header
            (createTopicClicked)="showCreateModal = true"
            (notificationsClicked)="showNotifications = true"
          ></app-forum-header>
          <main class="main-content">
            <div class="container">
              <div *ngIf="!selectedTopicId" class="topics-view"> <app-search-bar (search)="onSearch($event)"></app-search-bar>
                <app-category-filter (categorySelected)="onCategorySelected($event)"></app-category-filter>
                
                 <app-topics-list
                    *ngIf="!isLoadingTopics"
                    [topics]="displayedTopics"
                    (topicSelected)="onTopicSelected($event)"
                 ></app-topics-list>
              </div>
               <div *ngIf="selectedTopicId" class="detail-view">
                <app-topic-detail
                    [topicId]="selectedTopicId"
                    (back)="onBack()"
                ></app-topic-detail> </div>
            </div>
          </main>
           <app-create-topic-modal
                *ngIf="showCreateModal"
                (close)="showCreateModal = false"
                (topicCreated)="onTopicCreated($event)"
           ></app-create-topic-modal>
           <app-notifications-panel
                *ngIf="showNotifications"
                (close)="showNotifications = false"
                (notificationClicked)="onNotificationClicked($event)"
           ></app-notifications-panel> </div>
      </mat-card-content>
    </mat-card>
  `,
 // Styles remain the same
  styles: [`
    .forum-container { min-height: 100vh; background: #f9fafb; display: flex; flex-direction: column; }
    .main-content { flex: 1; padding: 2rem 0; }
    .container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }
    .topics-view, .detail-view { display: flex; flex-direction: column; gap: 1.5rem; }
     /* Basic loading style */
     div[loading], .loading-indicator { padding: 2rem; text-align: center; color: #6b7280; font-style: italic; } /* Added class */
    @media (max-width: 640px) { .main-content { padding: 1.5rem 0; } .container { padding: 0 1rem; } .topics-view, .detail-view { gap: 1rem; } }
  `]
})
export class ForumMainComponent implements OnInit, OnDestroy {
  displayedTopics: Topic[] = [];
  selectedTopicId: string | null = null;
  showCreateModal = false;
  showNotifications = false;
  isLoadingTopics = false;
  private topicsSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.isLoadingTopics = true;
    this.topicsSubscription = this.forumService.topics$.subscribe(topics => {
      this.displayedTopics = topics;
      this.isLoadingTopics = false;
    });
    this.loadInitialTopics();
  }

   ngOnDestroy(): void {
    this.topicsSubscription?.unsubscribe();
     this.searchSubscription?.unsubscribe();
  }

  loadInitialTopics(): void {
    this.isLoadingTopics = true;
    this.forumService.fetchAllTopics().subscribe({
      error: (err) => {
          console.error('Error loading initial topics:', err);
          this.isLoadingTopics = false;
      }
    });
  }

  onSearch(query: string): void {
     this.isLoadingTopics = true;
     this.selectedTopicId = null;
     this.searchSubscription?.unsubscribe();

     if (!query.trim()) {
       this.loadInitialTopics();
     } else {
        this.searchSubscription = this.forumService.searchTopics(query).subscribe({
         error: (err) => {
            console.error('Error searching topics:', err);
            this.isLoadingTopics = false;
         }
       });
     }
  }

  onCategorySelected(category: string | null): void {
     this.isLoadingTopics = true;
     this.selectedTopicId = null;
     this.forumService.filterByCategory(category);
     setTimeout(() => this.isLoadingTopics = false, 100);
  }

  onTopicSelected(topic: Topic): void {
     this.selectedTopicId = topic.id;
  }

  onBack(): void {
    this.selectedTopicId = null;
     this.loadInitialTopics();
  }

   onTopicCreated(newPost: Post): void {
     console.log('Topic created (Post):', newPost);
     this.showCreateModal = false;
     this.loadInitialTopics();
   }

   // Accept 'any' since the actual emitted value is not used here
   onNotificationClicked(event: any): void {
     // Even though the panel is non-functional, keep the basic logic
     // If a topicId *were* emitted, you'd use it here.
     // For now, it just closes the panel.
     // const topicId = event; // If event was the topicId string
     // if (topicId) this.selectedTopicId = topicId;
     this.showNotifications = false;
     // If a topicId was received, you might navigate or load details:
     // this.selectedTopicId = topicId; // Example
   }
}
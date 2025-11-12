import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumService } from 'src/app/services/forum.service'; // Adjust path
import { Observable, Subscription, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule

@Component({
  selector: 'app-forum-header',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Add MatIconModule
  template: `
    <header class="forum-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo">LLC Community Forum</h1>
        </div>

        <div class="header-actions">
           <button class="btn-icon notification-btn" (click)="toggleNotifications()" matTooltip="Notifications (Unavailable)">
             <mat-icon>notifications</mat-icon> </button>

          <button class="btn-primary" (click)="onCreateTopic()">
             <mat-icon>add</mat-icon> <span class="btn-text">New Topic</span>
          </button>
        </div>
      </div>
    </header>
  `,
 // Styles remain the same as provided in the original file
  styles: [`
    .forum-header { background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 100; }
    .header-content { max-width: 1200px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .logo { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn-icon { position: relative; padding: 0.5rem; border: none; background: transparent; border-radius: 0.5rem; cursor: pointer; color: #6b7280; transition: all 0.2s; }
    .btn-icon:hover { background: #f3f4f6; color: #1f2937; }
     /* Removed notification-badge styles */
    .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary mat-icon { flex-shrink: 0; } /* Use mat-icon selector */
     @media (max-width: 768px) { .header-content { padding: 0.875rem 1rem; } .logo { font-size: 1.125rem; } }
     @media (max-width: 640px) { .header-content { padding: 0.75rem 1rem; } .logo { font-size: 1rem; } .btn-text { display: none; } .btn-primary { padding: 0.625rem; } .header-actions { gap: 0.5rem; } }
  `]
})
export class ForumHeaderComponent { // Removed OnInit, OnDestroy
  @Output() createTopicClicked = new EventEmitter<void>();
  @Output() notificationsClicked = new EventEmitter<void>();

  // Removed unreadCount$ and subscription logic

  constructor(private forumService: ForumService) {} // ForumService might still be needed for other things

  onCreateTopic(): void {
    this.createTopicClicked.emit();
  }

  toggleNotifications(): void {
     // Still emits, but the panel will show "unavailable"
    this.notificationsClicked.emit();
  }
}
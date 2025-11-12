// src/app/pages/apps/conversational_forum/notifications-panel/notifications-panel.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-overlay" (click)="onClose()">
      <div class="panel-content" (click)="$event.stopPropagation()">
        <div class="panel-header">
          <h2 class="panel-title">Notifications</h2>
           <button class="close-btn" (click)="onClose()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
        </div>
        <div class="panel-body">
           <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <p>Notifications are currently unavailable.</p>
          </div>
        </div>
      </div>
    </div>
  `,
 // Styles remain the same as provided in the original file, slightly simplified
  styles: [`
     .panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .panel-content {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 400px;
      background: white;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s;
    }

     @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .panel-title { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 0; }

    .close-btn {
        padding: 0.25rem; border: none; background: transparent; color: #9ca3af;
        cursor: pointer; border-radius: 0.375rem; transition: all 0.2s;
     }
    .close-btn:hover { background: #f3f4f6; color: #1f2937; }

    .panel-body { flex: 1; overflow-y: auto; }

    .empty-state {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 3rem 1.5rem; color: #9ca3af; text-align: center;
     }
    .empty-state svg { margin-bottom: 1rem; }
    .empty-state p { margin: 0; font-size: 0.9375rem; }

     @media (max-width: 768px) {
        .panel-content { max-width: 100%; }
        .panel-header { padding: 1rem 1.25rem; }
        .panel-title { font-size: 1rem; }
     }
     @media (max-width: 640px) {
        .panel-header { padding: 1rem; }
     }
  `]
})
export class NotificationsPanelComponent {
  @Output() close = new EventEmitter<void>();
  // @Output() notificationClicked = new EventEmitter<string>(); // Keep if needed later

  constructor() {} // Removed ForumService injection

  onClose(): void {
    this.close.emit();
  }

  // Removed notification related methods (hasUnread, markAllAsRead, onNotificationClick, getTimeAgo)
}
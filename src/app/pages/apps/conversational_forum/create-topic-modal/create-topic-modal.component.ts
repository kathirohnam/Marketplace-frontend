import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumTopicDto } from 'src/app/models/forum-backend';
import { Post } from 'src/app/models/forum.model'; // Adjust path
import { ForumService } from 'src/app/services/forum.service'; // Adjust path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-topic-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Create New Topic</h2>
          <button class="close-btn" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" [(ngModel)]="selectedTopicId">
              <option value="" disabled>Select a category</option>
              <option *ngFor="let topic of availableTopics" [value]="topic.topicId">
                {{ topic.topicName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Title</label>
            <input
              type="text"
              class="form-input"
              placeholder="What's your question or topic?"
              [(ngModel)]="title"
              maxlength="300" />
            <div class="char-count">{{ title.length }}/300</div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              class="form-textarea"
              placeholder="Provide details about your topic..."
              rows="6"
              [(ngModel)]="content"
            ></textarea>
          </div>

          <div class="tips-section">
            <div class="tips-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              Tips for a great topic
            </div>
            <ul class="tips-list">
              <li>Be clear and specific in your title</li>
              <li>Provide enough context in the description</li>
              <li>Choose the most relevant category</li>
              <li>Be respectful and constructive</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">Cancel</button>
          <button
            class="btn-primary"
            [disabled]="!isValid()"
            (click)="onCreate()"
          >
            Create Topic
          </button>
        </div>
      </div>
    </div>
  `,
  // Styles remain the same as provided in the original file
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .close-btn {
      padding: 0.25rem;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-size: 0.9375rem;
    }

    .form-select,
    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.9375rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    .form-select:focus,
    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-textarea {
      resize: vertical;
      line-height: 1.5;
    }

    .char-count {
      text-align: right;
      font-size: 0.8125rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    .tips-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1.5rem;
    }

    .tips-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tips-list li {
      padding-left: 1.5rem;
      position: relative;
      color: #6b7280;
      font-size: 0.875rem;
      line-height: 1.6;
    }

    .tips-list li:before {
      content: "•";
      position: absolute;
      left: 0.5rem;
      color: #2563eb;
      font-weight: bold;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-secondary {
      padding: 0.625rem 1.25rem;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .btn-primary {
      padding: 0.625rem 1.25rem;
      border: none;
      background: #2563eb;
      color: white;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .modal-content {
        max-height: 92vh;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1.25rem;
      }
    }

    @media (max-width: 640px) {
      .modal-overlay {
        padding: 0.5rem;
      }

      .modal-content {
        max-height: 95vh;
        border-radius: 0.75rem;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }

      .modal-title {
        font-size: 1.125rem;
      }

      .form-label {
        font-size: 0.875rem;
      }

      .form-select,
      .form-input,
      .form-textarea {
        font-size: 0.875rem;
        padding: 0.625rem;
      }

      .modal-footer {
        flex-wrap: wrap;
      }

      .modal-footer button {
        flex: 1;
        min-width: 120px;
      }
    }
  `]
})
export class CreateTopicModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  // Emit the newly created Post object
  @Output() topicCreated = new EventEmitter<Post>(); // Changed payload

  availableTopics: ForumTopicDto[] = [];
  selectedTopicId: number | null = null; // Use number for backend ID
  title = '';
  content = '';
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


  onClose(): void {
    this.close.emit();
  }

  onCreate(): void {
    if (this.isValid() && this.selectedTopicId !== null) {
      this.forumService.createTopic(this.title, this.selectedTopicId, this.content)
        .subscribe({
          next: (newPost) => {
            this.topicCreated.emit(newPost); // Emit the created Post
            this.onClose();
          },
          error: (err) => {
            console.error('Error creating topic:', err);
            // Add user-friendly error handling here (e.g., show a toast message)
          }
        });
    }
  }

  isValid(): boolean {
    return this.selectedTopicId !== null &&
           this.title.trim().length > 0 &&
           this.content.trim().length > 0;
  }
}
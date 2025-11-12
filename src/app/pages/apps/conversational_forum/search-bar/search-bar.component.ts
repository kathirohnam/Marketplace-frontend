import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search topics, posts, or keywords..."
          [(ngModel)]="searchQuery"
          (input)="onSearchChange()"
        />
        <button
          *ngIf="searchQuery"
          class="clear-btn"
          (click)="clearSearch()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  // Styles remain the same as provided in the original file
  styles: [`
    .search-container {
      margin-bottom: 1.5rem;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      transition: all 0.2s;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 1rem;
      padding: 0.25rem;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      color: #1f2937;
      background: #f3f4f6;
    }

    @media (max-width: 640px) {
      .search-input {
        font-size: 1rem;
      }
    }
  `]
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  searchQuery = '';
   private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300), // Wait for 300ms pause in events
      distinctUntilChanged() // Only emit if value has changed
    ).subscribe(query => {
      this.search.emit(query);
    });
  }


  onSearchChange(): void {
     this.searchSubject.next(this.searchQuery); // Push the current query to the subject
    // The emission to the parent component happens via the subscription in the constructor
  }

  clearSearch(): void {
    this.searchQuery = '';
     this.searchSubject.next(''); // Emit empty string immediately on clear
  }

   ngOnDestroy() {
    this.searchSubject.complete(); // Clean up subscription
  }
}
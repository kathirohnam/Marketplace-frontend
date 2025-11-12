import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Post, User, Reply } from 'src/app/models/forum.model'; // Adjust path
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field'; // Import CdkTextareaAutosize

// Match the updated interface used in TopicDetailComponent
export interface ReplyDialogData {
  post: Post; // The post under which the reply occurs
  replyingTo?: Reply | null; // The specific reply being replied to (null if replying to post)
  currentUser: User;
}

@Component({
  selector: 'app-reply-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    TextFieldModule // Add TextFieldModule for CdkTextareaAutosize
  ],
   template: `
    <div class="reply-dialog-header">
         <h2 mat-dialog-title>
            Replying to {{ data.replyingTo ? data.replyingTo.author.name : data.post.author.name }}
        </h2>
        <button mat-icon-button (click)="onCancel()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
    </div>

      <mat-dialog-content>
         <div class="post-context">
          <div class="context-header">
             <img [src]="(data.replyingTo ? data.replyingTo.author.avatar : data.post.author.avatar)"
                  [alt]="(data.replyingTo ? data.replyingTo.author.name : data.post.author.name)" class="avatar">
            <span class="author-name">{{ data.replyingTo ? data.replyingTo.author.name : data.post.author.name }}</span>
          </div>
           <p class="post-content">{{ (data.replyingTo ? data.replyingTo.content : data.post.content) | slice:0:150 }}{{ (data.replyingTo ? data.replyingTo.content.length : data.post.content.length) > 150 ? '...' : '' }}</p>
        </div>

        <div class="new-reply-form">
          <img [src]="data.currentUser.avatar" [alt]="data.currentUser.name" class="avatar">
          <mat-form-field appearance="outline" class="reply-input">
            <mat-label>Your reply</mat-label>
            <textarea
              matInput
              [(ngModel)]="replyContent"
              cdkTextareaAutosize
              #autosize="cdkTextareaAutosize"
              cdkAutosizeMinRows="3"
              cdkAutosizeMaxRows="8"
              placeholder="Share your thoughts..."
            ></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!replyContent.trim()"
          (click)="onSubmit()"
        >
          Post Reply
        </button>
      </mat-dialog-actions>
  `,
 // Styles remain the same as provided in the original file
  styles: [`
     .reply-dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 0 12px 0 24px; border-bottom: 1px solid #e5e7eb; }
     h2[mat-dialog-title] { font-size: 1.25rem; font-weight: 600; margin-bottom: 0; }
     mat-dialog-content { padding: 20px 24px; }
     .post-context { background-color: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #f3f4f6; }
     .context-header { display: flex; align-items: center; gap: 0.75rem; }
     .avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; } /* Added object-fit */
     .author-name { font-weight: 600; }
     .post-content { margin: 0.75rem 0 0; color: #6b7280; line-height: 1.6; }
     .new-reply-form { display: flex; gap: 1rem; align-items: flex-start; }
     .reply-input { flex-grow: 1; }
     mat-dialog-actions { padding: 12px 24px; }
  `]
})
export class ReplyDialogComponent {
  replyContent = '';

  // Inject MAT_DIALOG_DATA with the correct type
  constructor(
    public dialogRef: MatDialogRef<ReplyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReplyDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close(); // Close without sending data
  }

  onSubmit(): void {
    if (this.replyContent.trim()) {
      // Return the content when submitting
      this.dialogRef.close(this.replyContent.trim());
    }
  }
}
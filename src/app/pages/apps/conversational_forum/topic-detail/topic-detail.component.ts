import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TopicDetail, Post, Reply, User } from 'src/app/models/forum.model'; // Adjust path
import { ForumService } from 'src/app/services/forum.service'; // Adjust path
import { UserService } from 'src/app/shared/userService';
import { ReplyDialogComponent } from '../reply-dialog.component'; // Adjust path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
   <div class="topic-detail" *ngIf="topic">
      <button class="back-btn" (click)="onBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back to topics</span>
      </button>

      <div class="posts-container">
        <ng-container *ngIf="topic.posts && topic.posts.length > 0">
         <div class="post-card main-post">
            <div class="topic-header-inline">
                 <div class="header-top">
                    <div class="topic-badges">
                    <span class="category-badge" [attr.data-category]="topic.category">
                        {{ topic.category }}
                    </span>
                    <span *ngIf="topic.isPinned" class="pinned-badge">
                        <mat-icon>push_pin</mat-icon>
                        Pinned
                    </span>
                    </div>
                    <div class="topic-stats">
                        <div class="stat-item"><mat-icon>forum</mat-icon><span>{{ topic.replyCount }}</span></div>
                        <div class="stat-item"><mat-icon>visibility</mat-icon><span>{{ topic.viewCount }}</span></div>
                    </div>
                 </div>
                 <h1 class="topic-title">{{ topic.title }}</h1>
                 <div class="topic-footer">
                    <mat-icon>schedule</mat-icon>
                    <span>Last activity {{ getTimeAgo(topic.lastActivity) }}</span>
                 </div>
            </div>
             <div class="post-header">
                <div class="author-info">
                    <img [src]="topic.posts[0].author.avatar" [alt]="topic.posts[0].author.name" class="avatar">
                    <div class="author-details">
                    <div class="author-name">{{ topic.posts[0].author.name }}</div>
                    <div class="post-time"><mat-icon class="time-icon">schedule</mat-icon>{{ getTimeAgo(topic.posts[0].createdAt) }}</div>
                    </div>
                </div>
                 <span class="author-badge"><mat-icon>person</mat-icon>Topic Starter</span>
             </div>
             <div class="post-content">{{ topic.posts[0].content }}</div>
             <div class="post-actions">
                 <button mat-stroked-button class="action-btn" [class.liked]="isPostLikedByCurrentUser(topic.posts[0])" (click)="onLikePost(topic.posts[0])" matTooltip="Like this post">
                    <mat-icon>{{ isPostLikedByCurrentUser(topic.posts[0]) ? 'thumb_up' : 'thumb_up_outline' }}</mat-icon>
                     <span>{{ topic.posts[0].likesCount ?? 0 }} {{ (topic.posts[0].likesCount ?? 0) === 1 ? 'Like' : 'Likes' }}</span>
                </button>
                 <button mat-stroked-button class="action-btn reply-btn" (click)="onReplyToPost(topic.posts[0])" matTooltip="Reply to this post">
                    <mat-icon>reply</mat-icon><span>Reply</span>
                </button>
            </div>

            <div *ngIf="topic.posts[0].replies && topic.posts[0].replies.length > 0" class="replies-section flat">
                 <div class="replies-header"><mat-icon>forum</mat-icon><span>{{ topic.posts[0].replies.length }} {{ topic.posts[0].replies.length === 1 ? 'Reply' : 'Replies' }}</span></div>
                <ng-container *ngFor="let reply of topic.posts[0].replies">
                  <ng-container *ngTemplateOutlet="replyCardTemplate; context: {$implicit: reply, post: topic.posts[0]}"></ng-container>
                </ng-container>
             </div>
        </div>
        </ng-container>

         <ng-container *ngFor="let post of topic.posts.slice(1); let i = index">
             <div class="post-card">
                 <div class="post-header">
                    <div class="author-info">
                        <img [src]="post.author.avatar" [alt]="post.author.name" class="avatar">
                        <div class="author-details">
                            <div class="author-name">{{ post.author.name }}</div>
                            <div class="post-time"><mat-icon class="time-icon">schedule</mat-icon>{{ getTimeAgo(post.createdAt) }}</div>
                        </div>
                    </div>
                    </div>
                <div class="post-content">{{ post.content }}</div>
                <div class="post-actions">
                    <button mat-stroked-button class="action-btn" [class.liked]="isPostLikedByCurrentUser(post)" (click)="onLikePost(post)" matTooltip="Like this reply">
                       <mat-icon>{{ isPostLikedByCurrentUser(post) ? 'thumb_up' : 'thumb_up_outline' }}</mat-icon>
                        <span>{{ post.likesCount ?? 0 }} {{ (post.likesCount ?? 0) === 1 ? 'Like' : 'Likes' }}</span>
                   </button>
                    <button mat-stroked-button class="action-btn reply-btn" (click)="onReplyToPost(post)" matTooltip="Reply to this comment">
                       <mat-icon>reply</mat-icon><span>Reply</span>
                   </button>
               </div>
                <div *ngIf="post.replies && post.replies.length > 0" class="replies-section">
                    <div class="replies-header"><mat-icon>subdirectory_arrow_right</mat-icon><span>{{ post.replies.length }} {{ post.replies.length === 1 ? 'Reply' : 'Replies' }}</span></div>
                    <ng-container *ngFor="let reply of post.replies">
                         <ng-container *ngTemplateOutlet="replyCardTemplate; context: {$implicit: reply, post: post}"></ng-container>
                    </ng-container>
                </div>
            </div>
        </ng-container>
      </div>

       <div class="reply-form">
         <div class="reply-form-header"><mat-icon>rate_review</mat-icon><h3 class="reply-form-title">Join the discussion</h3></div>
         <div class="current-user-info">
             <img [src]="currentUser.avatar" [alt]="currentUser.name" class="avatar-small">
             <span class="user-name">Posting as {{ currentUser.name }}</span>
         </div>
         <textarea class="reply-textarea" placeholder="Share your thoughts, ask questions, or provide feedback..." rows="5" [(ngModel)]="replyContent"></textarea>
         <div class="reply-form-actions">
            <button mat-button (click)="replyContent = ''" [disabled]="!replyContent.trim()"><mat-icon>close</mat-icon>Cancel</button>
            <button mat-raised-button color="primary" class="post-btn" [disabled]="!replyContent.trim()" (click)="submitReplyToTopic()">
                 <mat-icon>send</mat-icon>Post Reply
            </button>
         </div>
       </div>
    </div>

     <ng-template #replyCardTemplate let-reply let-post="post">
      <div class="reply-card">
        <div class="author-info">
          <img [src]="reply.author.avatar" [alt]="reply.author.name" class="avatar-small">
          <div class="author-details">
            <div class="author-name">{{ reply.author.name }}</div>
            <div class="post-time">{{ getTimeAgo(reply.createdAt) }}</div>
          </div>
        </div>
        <div class="reply-content">{{ reply.content }}</div>
        <div class="reply-actions">
          <button class="action-btn-reply" [class.liked]="isReplyLikedByCurrentUser(reply)" (click)="onLikeReply(reply)" matTooltip="Like this reply">
            <mat-icon>thumb_up</mat-icon>
             <span *ngIf="(reply.likesCount ?? 0) > 0">{{ reply.likesCount }}</span>
             <span>Like{{ (reply.likesCount ?? 0) !== 1 ? 's' : '' }}</span>
          </button>
          <button class="action-btn-reply reply" (click)="onReplyToReply(post, reply)" matTooltip="Reply to this comment">
            <mat-icon>reply</mat-icon>
             <span>Reply</span>
          </button>
        </div>
      </div>
    </ng-template>
  `,
  // Styles remain the same as provided in the original file
  styles: [`
    /* Add styles for .reply-card and .action-btn-reply if missing */
    .topic-detail { max-width: 100%; }
    .back-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.125rem; border: none; background: white; color: #6b7280; border-radius: 0.5rem; font-size: 0.9375rem; font-weight: 500; cursor: pointer; margin-bottom: 1.5rem; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
    .back-btn:hover { background: #f3f4f6; color: #1f2937; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
    .back-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .topic-header-inline { padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .topic-badges { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .topic-stats { display: flex; gap: 1rem; align-items: center; }
    .stat-item { display: flex; align-items: center; gap: 0.375rem; color: #6b7280; font-size: 0.875rem; font-weight: 600; }
    .stat-item mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .category-badge { display: flex; align-items: center; gap: 0.25rem; padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; background: #eff6ff; color: #2563eb; }
    .category-badge[data-category="Tax & Legal"] { background: #fef3c7; color: #d97706; }
    .category-badge[data-category="Business Growth"] { background: #d1fae5; color: #059669; }
    .category-badge[data-category="Success Stories"] { background: #fce7f3; color: #db2777; }
    .category-badge[data-category="LLC Formation"] { background: #ede9fe; color: #7c3aed; }
     .category-badge[data-category="General"] { background: #f3f4f6; color: #4b5563; } /* Added General style */
    .pinned-badge { display: flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; background: #fef3c7; color: #d97706; }
    .pinned-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .topic-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0 0 0.875rem 0; line-height: 1.3; }
    .topic-footer { display: flex; align-items: center; gap: 0.375rem; color: #6b7280; font-size: 0.875rem; }
    .topic-footer mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .posts-container { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .post-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .post-card:hover { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
    .post-card.main-post { border-color: #2563eb; border-width: 2px; background: linear-gradient(to bottom, #eff6ff, white); }
    .post-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
    .author-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 2.75rem; height: 2.75rem; border-radius: 9999px; background: #e5e7eb; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); object-fit: cover; } /* Added object-fit */
    .avatar-small { width: 2rem; height: 2rem; border-radius: 9999px; background: #e5e7eb; border: 2px solid white; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); object-fit: cover; } /* Added object-fit */
    .author-details { display: flex; flex-direction: column; gap: 0.125rem; }
    .author-name { font-weight: 600; color: #111827; font-size: 0.9375rem; }
    .post-time { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8125rem; color: #9ca3af; }
    .time-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }
    .author-badge { display: flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; background: #dbeafe; color: #2563eb; white-space: nowrap; }
    .author-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .post-content { color: #374151; line-height: 1.7; font-size: 0.9375rem; margin-bottom: 1.25rem; white-space: pre-wrap; }
    .post-actions { display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem !important; border-radius: 0.5rem !important; font-weight: 500 !important; font-size: 0.875rem !important; transition: all 0.2s; border-color: #e5e7eb !important; color: #6b7280 !important; }
    .action-btn:hover:not(.liked) { background: #f9fafb !important; border-color: #d1d5db !important; color: #374151 !important; }
    .action-btn.liked { background: #dbeafe !important; border-color: #93c5fd !important; color: #2563eb !important; }
    .action-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .reply-btn { /* Style for reply button */ }
    .replies-section { margin-top: 1.5rem; padding-left: 2.5rem; border-left: 3px solid #e5e7eb; }
    .replies-section.flat { margin-top: 1rem; padding-left: 0; border-left: none; display: flex; flex-direction: column; gap: 1rem; }
    .replies-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem; font-weight: 600; }
    .replies-header mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .reply-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.625rem; padding: 1.25rem; transition: all 0.2s; display: flex; flex-direction: column; gap: 0.75rem; }
    .replies-section:not(.flat) .reply-card { background: #f9fafb; }
    .reply-card:hover { border-color: #d1d5db; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
    .reply-content { color: #374151; line-height: 1.6; font-size: 0.9375rem; white-space: pre-wrap; margin: 0; padding: 0; }
    .reply-actions { display: flex; gap: 0.5rem; padding: 0; margin-top: 0.5rem; }
    .action-btn-reply { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid #d1d5db; background-color: transparent; color: #6b7280; transition: all 0.2s; }
    .action-btn-reply:hover { background-color: #f3f4f6; }
    .action-btn-reply mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .action-btn-reply.liked { background-color: #e0eaff; color: #3b82f6; border-color: transparent; }
    .action-btn-reply.liked:hover { background-color: #d1e0ff; }
     .action-btn-reply.reply { /* Optional: Different style for reply button on replies */ }
    .reply-form { background: white; border: 2px solid #e5e7eb; border-radius: 0.875rem; padding: 1.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .reply-form-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .reply-form-header mat-icon { color: #2563eb; font-size: 28px; width: 28px; height: 28px; }
    .reply-form-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0; }
    .current-user-info { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; }
    .user-name { font-size: 0.875rem; font-weight: 500; color: #6b7280; }
    .reply-textarea { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.625rem; font-size: 0.9375rem; font-family: inherit; line-height: 1.6; resize: vertical; transition: all 0.2s; min-height: 120px; }
    .reply-textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
    .reply-textarea::placeholder { color: #9ca3af; }
    .reply-form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .reply-form-actions button { display: flex; align-items: center; gap: 0.5rem; font-weight: 600 !important; }
    .reply-form-actions button mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .post-btn { background: #2563eb !important; color: white !important; padding: 0.625rem 1.5rem !important; }
    .post-btn:hover:not(:disabled) { background: #1d4ed8 !important; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); }
    .post-btn:disabled { opacity: 0.5; }
     /* Responsive adjustments */
     @media (max-width: 768px) { .topic-header-inline { padding-bottom: 1.25rem; margin-bottom: 1.25rem; } .header-top { flex-direction: column; align-items: flex-start; gap: 0.75rem; } .topic-title { font-size: 1.5rem; } .post-card { padding: 1.375rem; } .reply-form { padding: 1.5rem; } .post-actions { flex-wrap: wrap; } }
     @media (max-width: 640px) { .back-btn { width: 100%; justify-content: center; margin-bottom: 1rem; } .topic-header-inline { padding-bottom: 1rem; margin-bottom: 1rem; } .topic-title { font-size: 1.25rem; } .topic-stats { gap: 0.75rem; } .stat-item { font-size: 0.8125rem; } .post-card { padding: 1rem; } .post-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; } .author-badge { align-self: flex-start; } .post-content { font-size: 0.875rem; } .post-actions { gap: 0.5rem; } .action-btn { font-size: 0.8125rem !important; padding: 0.5rem 0.875rem !important; } .replies-section { padding-left: 0.75rem; border-left-width: 2px; margin-top: 1rem; } .reply-card { padding: 0.875rem; } .reply-content { padding-left: 0; font-size: 0.875rem;} .reply-actions { padding-left: 0; } .reply-form { padding: 1rem; } .reply-form-header mat-icon { font-size: 24px; width: 24px; height: 24px; } .reply-form-title { font-size: 1.125rem; } .reply-textarea { font-size: 0.875rem; min-height: 100px; } .reply-form-actions { flex-wrap: wrap; } .reply-form-actions button { flex: 1; min-width: 120px; } }
  `]
})
export class TopicDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() topicId: string | null = null; // Changed Input to topicId
  @Output() back = new EventEmitter<void>();

  topic: TopicDetail | null = null;
  replyContent = '';
  currentUser: User;
  isLoading = false;
  error: string | null = null;

  // Track like states locally for immediate UI feedback
  likedPosts = new Set<string>();
  likedReplies = new Set<string>();

  private topicSubscription: Subscription | null = null;


  constructor(
    private forumService: ForumService,
    private userService: UserService, // Inject UserService
    private dialog: MatDialog
  ) {
     // Get current user details from UserService
    this.currentUser = this.getCurrentUserDetails();
  }

   ngOnInit(): void {
    if (this.topicId) {
      this.fetchTopicDetails(this.topicId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
     // If topicId input changes, fetch new details
    if (changes['topicId'] && !changes['topicId'].firstChange && this.topicId) {
       this.fetchTopicDetails(this.topicId);
    }
  }

   ngOnDestroy(): void {
    this.topicSubscription?.unsubscribe();
  }


   private getCurrentUserDetails(): User {
    const userModel = this.userService.getUserSnapshot();
    const loginId = sessionStorage.getItem('login_user_id');
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginId || 'defaultUser'}`;

    return {
        id: loginId || 'unknown-user', // Use ID from session storage
        name: userModel ? `${userModel.firstName || ''} ${userModel.lastName || ''}`.trim() || 'You' : 'You',
        avatar: userModel?.profileImageUrl || defaultAvatar
    };
  }

  fetchTopicDetails(id: string): void {
    this.isLoading = true;
    this.error = null;
     this.topicSubscription = this.forumService.getTopicById(id).subscribe({
      next: (topicDetail) => {
        this.topic = topicDetail;
         this.initializeLikeStates(); // Initialize like states after fetching
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching topic details:', err);
        this.error = 'Failed to load topic details.';
        this.isLoading = false;
      }
    });
  }

   // Initialize local like states based on fetched data (assuming backend doesn't provide this)
  initializeLikeStates(): void {
    this.likedPosts.clear();
    this.likedReplies.clear();
    // This part requires backend to tell us if the *current user* liked something.
    // Since the backend only provides counts, we cannot reliably initialize the liked status.
    // The UI will initially show "not liked" and update only after the user clicks.
    // If backend provided a `likedByCurrentUser: boolean` field, we'd use it here.
     /* Example if backend provided likedByCurrentUser:
     this.topic?.posts.forEach(post => {
         if (post.likedByCurrentUser) { this.likedPosts.add(post.id); }
         post.replies.forEach(reply => {
             if (reply.likedByCurrentUser) { this.likedReplies.add(reply.id); }
         });
     });
     */
  }


  onBack(): void {
    this.back.emit();
  }

   // Reply directly to the main topic (creates a new Post in the backend)
   submitReplyToTopic(): void {
    if (this.replyContent.trim() && this.topic && this.topic.posts.length > 0) {
      const mainPostId = this.topic.posts[0].id; // ID of the first post (topic starter)
      // Call service to add a new post (reply) linked to the topic
       this.forumService.addReplyToPost(mainPostId, this.replyContent)
          .subscribe({
                next: (newReply) => { // Assuming backend returns the new ReplyDto mapped to Reply
                    this.replyContent = '';
                    this.fetchTopicDetails(this.topicId!); // Refresh details
                },
                error: (err) => console.error('Error submitting reply:', err)
            });
    }
  }


   onLikePost(post: Post): void {
    const currentlyLiked = this.isPostLikedByCurrentUser(post);
    // Optimistically update UI
    if(currentlyLiked) {
        this.likedPosts.delete(post.id);
        post.likesCount = (post.likesCount ?? 1) -1; // Decrement count
    } else {
         this.likedPosts.add(post.id);
         post.likesCount = (post.likesCount ?? 0) + 1; // Increment count
    }

    this.forumService.toggleLike(post.id, null).subscribe({
        next: (newCount) => {
            post.likesCount = newCount; // Update with actual count from backend
             // No need to manually add/remove from likedPosts again if backend confirms
        },
        error: (err) => {
            console.error('Error toggling post like:', err);
             // Revert optimistic update on error
            if(currentlyLiked) {
                this.likedPosts.add(post.id);
                post.likesCount = (post.likesCount ?? 0) + 1;
            } else {
                 this.likedPosts.delete(post.id);
                post.likesCount = (post.likesCount ?? 1) - 1;
            }
        }
    });
  }

  onLikeReply(reply: Reply): void {
      const currentlyLiked = this.isReplyLikedByCurrentUser(reply);
      // Optimistic UI update
      if (currentlyLiked) {
          this.likedReplies.delete(reply.id);
          reply.likesCount = (reply.likesCount ?? 1) - 1;
      } else {
          this.likedReplies.add(reply.id);
          reply.likesCount = (reply.likesCount ?? 0) + 1;
      }


     this.forumService.toggleLike(null, reply.id).subscribe({
        next: (newCount) => {
             reply.likesCount = newCount; // Update with actual count
        },
        error: (err) => {
            console.error('Error toggling reply like:', err);
             // Revert optimistic update
            if (currentlyLiked) {
                this.likedReplies.add(reply.id);
                reply.likesCount = (reply.likesCount ?? 0) + 1;
            } else {
                this.likedReplies.delete(reply.id);
                reply.likesCount = (reply.likesCount ?? 1) - 1;
            }
        }
     });
  }

   // Opens dialog to reply to a specific POST (which might be the topic starter or another reply post)
   onReplyToPost(postToReplyTo: Post): void {
       this.openReplyDialog(postToReplyTo, null);
   }

   // Opens dialog to reply to a specific REPLY
   onReplyToReply(parentPost: Post, replyToReplyTo: Reply): void {
       this.openReplyDialog(parentPost, replyToReplyTo);
   }


   private openReplyDialog(parentPost: Post, parentReply: Reply | null): void {
       const dialogRef = this.dialog.open(ReplyDialogComponent, {
           width: '600px',
           maxWidth: '90vw',
           data: {
               // Pass the POST we are ultimately replying under
               post: parentPost,
               // Pass the specific REPLY we are replying TO (if any)
               replyingTo: parentReply,
               currentUser: this.currentUser
           }
       });

       dialogRef.afterClosed().subscribe(result => {
           if (result && typeof result === 'string' && this.topic) { // Ensure result is the content string
               const content = result;
               if (parentReply) {
                   // This is a nested reply (replying to a reply)
                   this.forumService.addNestedReply(parentPost.id, parentReply.id, content)
                       .subscribe({
                           next: () => this.fetchTopicDetails(this.topicId!), // Refresh on success
                           error: (err) => console.error('Error adding nested reply:', err)
                       });
               } else {
                   // This is a direct reply to a post
                   this.forumService.addReplyToPost(parentPost.id, content)
                      .subscribe({
                           next: () => this.fetchTopicDetails(this.topicId!), // Refresh on success
                           error: (err) => console.error('Error adding direct reply:', err)
                       });
               }
           }
       });
   }


  // Check local state for immediate feedback
  isPostLikedByCurrentUser(post: Post): boolean {
    return this.likedPosts.has(post.id);
  }

  isReplyLikedByCurrentUser(reply: Reply): boolean {
      return this.likedReplies.has(reply.id);
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

// Ensure ReplyDialogComponent's data interface matches what's passed
export interface ReplyDialogData {
  post: Post; // The post under which the reply occurs
  replyingTo?: Reply | null; // The specific reply being replied to (null if replying to post)
  currentUser: User;
}
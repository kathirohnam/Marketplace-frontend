// src/app/services/forum.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap ,switchMap} from 'rxjs';
import { Topic, TopicDetail, Post, User, Reply, Category } from 'src/app/models/forum.model'; // Assuming models are in this path
import { PostDto, ReplyDto, ForumTopicDto } from 'src/app/models/forum-backend'; // DTO interfaces
import { UserService } from '../shared/userService';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ForumService {
    // Adjust the API base URL according to your environment
    private  readonly apiUrl = `${environment.apiBaseUrl}/forum`; // Example: Replace with your actual backend base URL

    private topicsSubject = new BehaviorSubject<Topic[]>([]);
    public topics$ = this.topicsSubject.asObservable();

    private selectedTopicSubject = new BehaviorSubject<TopicDetail | null>(null);
    public selectedTopic$ = this.selectedTopicSubject.asObservable();

    private availableTopicsSubject = new BehaviorSubject<ForumTopicDto[]>([]);
    public availableTopics$ = this.availableTopicsSubject.asObservable();


    constructor(private http: HttpClient, private userService: UserService) {
        this.fetchAvailableTopics(); // Fetch topics for dropdowns on init
    }

    // --- Utility ---

    private getLoginUserId(): string | null {
        return sessionStorage.getItem('login_user_id');
    }

    private getCurrentUser(): User {
        const userModel = this.userService.getUserSnapshot();
        // Provide a default avatar if needed, or get from userModel if available
        const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=defaultUser';
        return {
            // Convert backend loginUserId (Long) to string for frontend model
            id: this.getLoginUserId() || 'unknown-user',
            // Combine first and last names if available, otherwise use a placeholder
            name: userModel ? `${userModel.firstName || ''} ${userModel.lastName || ''}`.trim() : 'You',
            avatar: userModel?.profileImageUrl || defaultAvatar // Use profileImageUrl if present
        };
    }


    // Map Backend PostDto to Frontend Post
    private mapToPost(dto: PostDto): Post {
        return {
            id: dto.postId.toString(), // Convert Long to string
            content: dto.content, // Use content field
            author: {
                id: dto.loginUserId.toString(),
                name: dto.loginUserName || 'Unknown User',
                // Generate avatar URL based on user ID or name
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.loginUserId}`
            },
            createdAt: new Date(dto.createdAt),
            // We only get likesCount, so initialize likes array based on local state if needed elsewhere,
            // or just rely on the count for display. Backend doesn't give *who* liked.
            likes: [], // Cannot determine who liked from backend DTO
            replies: dto.replies ? dto.replies.map(r => this.mapToReply(r)) : [],
            // Add likesCount if needed for display directly
            likesCount: dto.likesCount
        };
    }

    // Map Backend ReplyDto to Frontend Reply
    private mapToReply(dto: ReplyDto): Reply {
        return {
            id: dto.replyId.toString(), // Convert Long to string
            content: dto.content,
            author: {
                id: dto.loginUserId.toString(),
                name: dto.loginUserName || 'Unknown User',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.loginUserId}`
            },
            createdAt: new Date(dto.createdAt),
            likes: [], // Cannot determine who liked from backend DTO
             // Add likesCount if needed for display directly
            likesCount: dto.likesCount
        };
    }

     // Map Backend PostDto to Frontend Topic (for list view)
     private mapToTopic(dto: PostDto): Topic {
        return {
            id: dto.postId.toString(), // Assuming Post ID represents the Topic starter post ID
            title: dto.title,
            // Assuming category comes from the topicName or needs separate handling
            category: dto.topicName || 'General', // Default or map if possible
            author: {
                id: dto.loginUserId.toString(),
                name: dto.loginUserName || 'Unknown User',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.loginUserId}`
            },
            replyCount: dto.replyCount,
            viewCount: dto.viewsCount,
            lastActivity: new Date(dto.lastActivityAt),
            createdAt: new Date(dto.createdAt),
            isPinned: dto.pinned,
            preview: dto.content ? dto.content.substring(0, 100) + (dto.content.length > 100 ? '...' : '') : '' // Generate preview
        };
    }

    // Map Backend PostDto to Frontend TopicDetail
    private mapToTopicDetail(dto: PostDto): TopicDetail {
        // TopicDetail includes posts. Backend seems to return only the specific post.
        // We might need another call or adjust backend to return all posts for a topic.
        // For now, assume the dto contains the main post, and replies are nested within it.
        const mainPost = this.mapToPost(dto);
        return {
            id: dto.topicId.toString(), // Use the actual topic ID from the DTO
            title: dto.title,
            category: dto.topicName || 'General',
             author: { // Author of the topic (first post creator)
                id: dto.loginUserId.toString(),
                name: dto.loginUserName || 'Unknown User',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.loginUserId}`
            },
            replyCount: dto.replyCount,
            viewCount: dto.viewsCount,
            lastActivity: new Date(dto.lastActivityAt),
            createdAt: new Date(dto.createdAt),
            isPinned: dto.pinned,
            // Backend GET /post only returns ONE post. We place it here.
            // A separate call might be needed to get *all* posts for the topic.
            // Or the backend /posts/by-topic endpoint should be used and adapted.
             posts: [mainPost], // Contains only the main post fetched
             preview: dto.content ? dto.content.substring(0, 100) + (dto.content.length > 100 ? '...' : '') : ''
        };
    }


    // --- API Calls ---

    // Fetch all topics (posts) for the main list view
    public fetchAllTopics(page: number = 0, size: number = 20): Observable<Topic[]> {
        const userId = this.getLoginUserId();
        if (!userId) {
            console.error('User not logged in');
            return new Observable<Topic[]>(observer => observer.next([])); // Return empty
        }
        let params = new HttpParams()
            .set('login_user_id', userId)
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<{ content: PostDto[], totalElements: number }>(`${this.apiUrl}/all-posts`, { params }).pipe(
            map(response => response.content.map(this.mapToTopic)),
            tap(topics => this.topicsSubject.next(topics)) // Update the subject
        );
    }

     // Fetch posts for a specific topic ID (adjust backend if needed)
    public fetchPostsByTopicId(topicId: string, page: number = 0, size: number = 50): Observable<Post[]> {
        const userId = this.getLoginUserId();
         if (!userId) {
            console.error('User not logged in');
            return new Observable<Post[]>(observer => observer.next([]));
        }
        let params = new HttpParams()
            // Backend uses topicId for filtering posts by topic
            .set('topic_id', topicId)
            .set('login_user_id', userId)
            .set('page', page.toString())
            .set('size', size.toString());

        // Use the /posts/by-topic endpoint
        return this.http.get<{ content: PostDto[] }>(`${this.apiUrl}/posts/by-topic`, { params }).pipe(
            map(response => response.content.map(dto => this.mapToPost(dto)))
             // Note: This only fetches posts, not the full TopicDetail structure directly.
             // The component might need to combine this with topic info.
        );
    }

    // Fetch details for a single Topic (based on its initial Post ID)
    public getTopicById(postId: string): Observable<TopicDetail> {
        const userId = this.getLoginUserId();
        if (!userId) {
             console.error('User not logged in');
             // Return an observable that emits null or throws an error
             return new Observable<TopicDetail>(observer => observer.error('User not logged in'));
        }
        let params = new HttpParams()
            .set('post_id', postId) // Backend uses post_id
            .set('login_user_id', userId);

         // Increment view count separately - Fire and forget
        this.incrementViewCount(postId).subscribe();


        return this.http.get<PostDto>(`${this.apiUrl}/post`, { params }).pipe(
           map(postDto => {
                 // Map the fetched PostDto to TopicDetail
                const topicDetail = this.mapToTopicDetail(postDto);

                // Fetch all posts related to this topicId separately
                return this.fetchPostsByTopicId(topicDetail.id).pipe(
                    map(posts => {
                        topicDetail.posts = posts; // Assign all fetched posts
                         this.selectedTopicSubject.next(topicDetail); // Update subject
                        return topicDetail;
                    })
                );
            }),
            // SwitchMap flattens the Observable<Observable<TopicDetail>>
            switchMap(observableTopicDetail => observableTopicDetail)
        );
    }

      // Increment view count
    private incrementViewCount(postId: string): Observable<number> {
        const userId = this.getLoginUserId();
        if (!userId) {
            return new Observable<number>(observer => observer.error('User not logged in'));
        }
        let params = new HttpParams()
            .set('post_id', postId)
            .set('login_user_id', userId);
        // Backend returns the new view count (int)
        return this.http.post<number>(`${this.apiUrl}/post/view`, null, { params });
    }

    // Search topics (posts)
    public searchTopics(query: string, page: number = 0, size: number = 20): Observable<Topic[]> {
         let params = new HttpParams()
            .set('query', query)
            .set('page', page.toString())
            .set('size', size.toString());

        // Backend returns List<PostDto>, not Page
        return this.http.get<PostDto[]>(`${this.apiUrl}/search`, { params }).pipe(
            map(dtos => dtos.map(this.mapToTopic)),
             tap(topics => this.topicsSubject.next(topics)) // Update subject with search results
        );
    }

    // Filter by category - Requires backend support or client-side filtering
    public filterByCategory(category: string | null): void {
        // Implement client-side filtering for now, or add backend endpoint later
        // Example client-side (assuming fetchAllTopics was called first):
        this.fetchAllTopics().subscribe(allTopics => {
             if (!category) {
                 this.topicsSubject.next(allTopics);
             } else {
                 const filtered = allTopics.filter(t => t.category === category);
                 this.topicsSubject.next(filtered);
             }
        });
        // OR: Add backend endpoint like /all-posts?category=... and call it here
    }

    // Fetch available topics for dropdowns
    public fetchAvailableTopics(): void {
         this.http.get<ForumTopicDto[]>(`${this.apiUrl}/topics`).subscribe(topics => {
            this.availableTopicsSubject.next(topics);
        });
    }

    // Create a new topic (creates the first post)
    public createTopic(title: string, topicId: number, content: string): Observable<Post> {
        const userId = this.getLoginUserId();
        if (!userId) {
             return new Observable<Post>(observer => observer.error('User not logged in'));
        }
        const body = {
            topicId: topicId, // Use the selected topic ID from dropdown
            title: title,
            descriptionMd: content // Map content to descriptionMd
        };
        let params = new HttpParams().set('login_user_id', userId);

        return this.http.post<PostDto>(`${this.apiUrl}/posts`, body, { params }).pipe(
            map(dto => this.mapToPost(dto)),
            tap(() => this.fetchAllTopics().subscribe()) // Refresh topic list
        );
    }

    // Add a reply to a post
    public addReplyToPost(postId: string, content: string): Observable<Reply> {
        const userId = this.getLoginUserId();
         if (!userId) {
             return new Observable<Reply>(observer => observer.error('User not logged in'));
        }
        const body = {
            postId: parseInt(postId, 10), // Convert string ID to number (Long)
            parentReplyId: null, // This is a direct reply to a post
            contentMd: content // Map content to contentMd
        };
         let params = new HttpParams().set('login_user_id', userId);

        return this.http.post<ReplyDto>(`${this.apiUrl}/replies`, body, { params }).pipe(
            map(dto => this.mapToReply(dto)),
             tap(() => { // Refresh the currently selected topic after adding a reply
                const currentTopic = this.selectedTopicSubject.value;
                if (currentTopic) {
                    this.getTopicById(currentTopic.posts[0].id).subscribe(); // Refresh based on main post ID
                }
            })
        );
    }

     // Add a nested reply to another reply
     // NOTE: Backend service ForumReplyService needs implementation for nested replies (parentReplyId)
     public addNestedReply(postId: string, parentReplyId: string, content: string): Observable<Reply> {
        const userId = this.getLoginUserId();
         if (!userId) {
            return new Observable<Reply>(observer => observer.error('User not logged in'));
        }
        const body = {
            postId: parseInt(postId, 10),
            parentReplyId: parseInt(parentReplyId, 10), // Set the parent reply ID
            contentMd: content
        };
         let params = new HttpParams().set('login_user_id', userId);

        return this.http.post<ReplyDto>(`${this.apiUrl}/replies`, body, { params }).pipe(
            map(dto => this.mapToReply(dto)),
            tap(() => {
                const currentTopic = this.selectedTopicSubject.value;
                if (currentTopic) {
                     this.getTopicById(currentTopic.posts[0].id).subscribe();
                }
            })
        );
    }

    // Toggle like for a post or a reply
    public toggleLike(postId: string | null, replyId: string | null): Observable<number> {
        const userId = this.getLoginUserId();
        if (!userId) {
             return new Observable<number>(observer => observer.error('User not logged in'));
        }
         let params = new HttpParams().set('login_user_id', userId);
         if (postId) {
             params = params.set('post_id', postId);
         }
         if (replyId) {
             params = params.set('reply_id', replyId);
         }

        // Backend returns the new like count (int)
        return this.http.post<number>(`${this.apiUrl}/likes`, null, { params }).pipe(
            tap(() => { // Refresh topic detail after like/unlike
                const currentTopic = this.selectedTopicSubject.value;
                 if (currentTopic) {
                    // Check if the like was for the main topic post or a reply within it
                    const targetPostId = postId || currentTopic.posts.find(p => p.replies.some(r => r.id === replyId))?.id;
                     if(targetPostId) {
                        this.getTopicById(currentTopic.posts[0].id).subscribe(); // Refresh based on main post ID
                     }
                } else if (postId) {
                    // If not in detail view, maybe refresh the main list if needed
                     this.fetchAllTopics().subscribe();
                 }
            })
        );
    }

    // --- Notifications ---
    // Omitted as per backend analysis.

}


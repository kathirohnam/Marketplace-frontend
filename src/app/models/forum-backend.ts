// Define DTO interfaces (create a separate file like `forum-backend.dto.ts` for better organization)
export interface PostDto {
    postId: number;
    loginUserId: number;
    loginUserName: string;
    topicId: number;
    topicName: string;
    title: string;
    content: string; // Corresponds to descriptionMd in backend
    replies?: ReplyDto[]; // Might be hydrated separately
    pinned: boolean;
    pinnedById: number | null;
    likesCount: number;
    viewsCount: number;
    replyCount: number;
    deleted: boolean;
    createdAt: string; // ISO Date string
    editedAt: string | null;
    lastActivityAt: string; // ISO Date string
}

export interface ReplyDto {
    replyId: number;
    postId: number;
    parentReplyId: number | null;
    loginUserId: number;
    loginUserName: string;
    content: string; // Corresponds to contentMd in backend
    depth: number;
    likesCount: number;
    deleted: boolean;
    createdAt: string; // ISO Date string
    editedAt: string | null;
}

export interface ForumTopicDto {
    topicId: number;
    topicName: string;
}
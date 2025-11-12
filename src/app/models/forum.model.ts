// src/app/models/forum.model.ts

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likes: string[]; // Keep track of who liked locally if needed, even if backend doesn't provide it directly
  likesCount?: number; // Add optional likesCount from backend DTO
}

export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likes: string[]; // Keep track of who liked locally if needed
  replies: Reply[];
  likesCount?: number; // Add optional likesCount from backend DTO
}

// Simplified version for list views
export interface Topic {
  id: string;
  title: string;
  category: string;
  author: User;
  replyCount: number;
  viewCount: number;
  lastActivity: Date;
  createdAt: Date;
  isPinned?: boolean;
  preview?: string;
}

// Complete model used as the single source of truth
export interface TopicDetail extends Topic {
  posts: Post[];
}

export interface Notification {
  id: string;
  type: 'reply' | 'mention' | 'like';
  topicId: string;
  topicTitle: string;
  author: User;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export type Category = 'LLC Formation' | 'Tax & Legal' | 'Business Growth' | 'Success Stories' | 'General';
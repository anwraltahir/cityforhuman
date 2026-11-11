/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'visitor' | 'member' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

export interface Chapter {
  id: number;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  keyThemes: string[];
  discussionsCount: number;
  commentsCount: number;
  isActive: boolean;
}

export interface Discussion {
  id: string;
  chapterId: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  imageUrl?: string;
  views: number;
  likes: string[]; // user IDs
  followers: string[]; // user IDs
  commentsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  discussionId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  likes: string[]; // user IDs
  createdAt: string;
  isEdited?: boolean;
  replies?: Comment[];
}

export type ArticleStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBio?: string;
  status: ArticleStatus;
  moderatorNotes?: string;
  views: number;
  createdAt: string;
  publishedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reply' | 'like' | 'follow' | 'article_status' | 'report_action' | 'system';
  targetType?: 'discussion' | 'article';
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'discussion' | 'comment' | 'article';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolution?: string;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  moderatorName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  bookTitle: string;
  bookSubtitle: string;
  authorName: string;
  authorBio: string;
  communityIntro: string;
  officialDomain: string;
  contactEmail: string;
}

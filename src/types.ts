import { Timestamp } from './lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string; // Custom username
  email: string;
  photoURL?: string;
  xp: number;
  level: number;
  badges: string[];
  bio?: string;
  isAdmin: boolean;
  isPersonOfMonth: boolean;
  hasBeenFeatured?: boolean;
  isPremium?: boolean;
  lastPremiumReminder?: string; // ISO String
  streak?: number;
  articleCount?: number;
  followers: string[]; // Following logic
  following: string[]; // Following logic
  location?: { lat: number, lng: number, city?: string };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type PostTag = 'Ocean' | 'Community Work' | 'Event' | 'Outreach' | 'Clean up' | 'Social';

export const AVAILABLE_TAGS: PostTag[] = [
  'Ocean',
  'Community Work',
  'Event',
  'Outreach',
  'Clean up',
  'Social'
];

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // Video support
  likes: string[];
  commentCount: number;
  isFeatured: boolean;
  type: 'ripple' | 'article';
  tags: PostTag[];
  reportCount?: number;
  isReported?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CleanupEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  date: Timestamp;
  locationName: string;
  coordinates?: { lat: number, lng: number };
  participants: string[];
  tags: string[];
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  receiverId: string;
  senderId: string;
  senderName: string;
  type: 'follow' | 'like' | 'comment' | 'featured' | 'event';
  content: string; // Added content
  postId?: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt: Timestamp;
}

export interface Gift {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  type: 'xp' | 'comment';
  value: string;
  createdAt: Timestamp;
}

export const XP_PER_LEVEL = 20;

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXPProgress(xp: number): number {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

export type EcoTitle = 'None' | 'Auditor' | 'Protector' | 'Defender' | 'Guardian' | 'Eco Chancellor';

export function getPrestigeTitle(profile: UserProfile): EcoTitle {
  if (profile.isAdmin || profile.email === 'belanjaoy@gmail.com') return 'Eco Chancellor';

  const now = new Date();
  const created = profile.createdAt.toDate();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const tenureMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));

  const hasArticle = (profile.articleCount || 0) >= 1;
  const hasBeenFeatured = profile.hasBeenFeatured || profile.isPersonOfMonth;

  if (tenureMonths >= 36 && profile.xp >= 400 && hasBeenFeatured) return 'Guardian';
  if (tenureMonths >= 20 && profile.xp >= 300) return 'Defender';
  if (tenureMonths >= 8 && profile.xp >= 100 && hasArticle) return 'Protector';
  if (tenureMonths >= 3 && profile.xp >= 20) return 'Auditor';

  return 'None';
}

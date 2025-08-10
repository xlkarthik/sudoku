/**
 * Social features and community-related types
 */

export enum LeaderboardType {
  GLOBAL = 'global',
  FRIENDS = 'friends',
  COUNTRY = 'country',
  DAILY_CHALLENGE = 'daily_challenge',
  TOURNAMENT = 'tournament'
}

export enum Timeframe {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked'
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  rank: number;
  rating: number;
  country: string;
  isCurrentUser: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface ShareLink {
  id: string;
  puzzleId: string;
  createdBy: string;
  message: string;
  url: string;
  qrCode: string;
  expiresAt?: Date;
  createdAt: Date;
  viewCount: number;
}

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  parentReplyId?: string; // For nested replies
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  puzzles: string[]; // Puzzle IDs
  participants: TournamentParticipant[];
  maxParticipants?: number;
  entryFee?: number;
  prizes: Prize[];
  rules: TournamentRules;
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date;
}

export interface TournamentParticipant {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  completedPuzzles: number;
  totalTime: number; // in seconds
  rank: number;
  joinedAt: Date;
}

export interface Prize {
  rank: number;
  type: 'premium_days' | 'badge' | 'currency' | 'physical';
  value: string;
  description: string;
}

export interface TournamentRules {
  timeLimit?: number; // per puzzle in seconds
  hintsAllowed: boolean;
  maxHints?: number;
  mistakePenalty: number; // points deducted per mistake
  speedBonus: boolean;
  difficultyMultiplier: Record<string, number>;
}
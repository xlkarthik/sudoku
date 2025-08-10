/**
 * User-related types and interfaces
 */
import { Difficulty } from './puzzle.js';
export declare enum Theme {
    LIGHT = "light",
    DARK = "dark",
    COLORFUL = "colorful",
    HIGH_CONTRAST = "high_contrast"
}
export declare enum SubscriptionTier {
    FREE = "free",
    PREMIUM = "premium",
    PREMIUM_PLUS = "premium_plus"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    TRIAL = "trial"
}
export declare enum AchievementType {
    SOLVE_COUNT = "solve_count",
    STREAK = "streak",
    SPEED = "speed",
    DIFFICULTY = "difficulty",
    VARIANT = "variant",
    SOCIAL = "social",
    SPECIAL = "special"
}
export interface UserProfile {
    displayName: string;
    avatar: string;
    country: string;
    timezone: string;
    preferredLanguage: string;
    bio?: string;
    isPublic: boolean;
}
export interface UserPreferences {
    theme: Theme;
    soundEnabled: boolean;
    musicEnabled: boolean;
    hintsEnabled: boolean;
    errorHighlighting: boolean;
    autoFillCandidates: boolean;
    gestureControls: boolean;
    showTimer: boolean;
    confirmMoves: boolean;
    fontSize: number;
    animationsEnabled: boolean;
}
export interface RatingEntry {
    date: Date;
    rating: number;
    change: number;
    puzzleId: string;
    difficulty: Difficulty;
}
export interface UserStatistics {
    totalPuzzlesSolved: number;
    currentStreak: number;
    longestStreak: number;
    averageSolveTime: Record<Difficulty, number>;
    bestTimes: Record<Difficulty, number>;
    currentRating: number;
    peakRating: number;
    ratingHistory: RatingEntry[];
    accuracyRate: number;
    totalPlayTime: number;
    puzzlesSolvedByDifficulty: Record<Difficulty, number>;
    hintsUsedTotal: number;
    mistakesTotal: number;
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    type: AchievementType;
    icon: string;
    requirement: number;
    progress: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
export interface SubscriptionInfo {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
    paymentMethod?: string;
    features: string[];
}
export interface User {
    id: string;
    email: string;
    username: string;
    profile: UserProfile;
    preferences: UserPreferences;
    subscription: SubscriptionInfo;
    statistics: UserStatistics;
    achievements: Achievement[];
    friends: string[];
    blockedUsers: string[];
    createdAt: Date;
    lastActiveAt: Date;
    isVerified: boolean;
    isBanned: boolean;
}
export interface UserSession {
    userId: string;
    sessionId: string;
    deviceId: string;
    platform: 'web' | 'ios' | 'android';
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}
//# sourceMappingURL=user.d.ts.map
import type { TrustMetrics } from '@/src/features/trust/types';

export type UserSummary = {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  avatarUri?: string;
  verified?: boolean;
};

export type UserProfile = UserSummary & {
  phone: string;
  bio: string;
  city: string;
  interests: string[];
  dateOfBirth: string;
  verifiedPhone: boolean;
  preferredVibes: string[];
};

export type DemoUser = UserSummary & TrustMetrics & {
  bio: string;
  city: string;
  interests: string[];
  friendIds: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
};

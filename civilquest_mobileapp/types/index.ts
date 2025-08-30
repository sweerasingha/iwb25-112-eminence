// Base types
export type ID = string;

// Enums
export enum UserRole {
  USER = "USER",
  PREMIUM_USER = "PREMIUM_USER",
  ADMIN = "ADMIN",
}

export enum EventStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum SponsorshipStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface User {
  _id?: {
    $oid: string;
  };
  id?: ID;
  email: string;
  name: string;
  phoneNumber?: string | null;
  role: UserRole;
  verified: boolean;
  points: number;
  username?: string | null;
  address?: string | null;
  hometown?: string | null;
  livingCity?: string | null;
  gender?: string | null;
  otpVerified: boolean;
  nationalid?: string | null;
  profile_url?: string | null;
  id_photo_url?: string | null;
  eventId?: string | null;
  organizeEventId?: string | null;
  organizeeventId?: ID[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenUser {
  email: string;
  role: string;
}

export interface DecodedToken {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  role: string;
}

export interface Event {
  _id: ID;
  id: ID;
  createdAt: string;
  updatedAt: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  eventTitle: string;
  eventType: string;
  eventDescription: string;
  createdBy: string;
  approvedBy: string | null;
  status: EventStatus;
  sponsor: any[];
  sponsors?: EventSponsor[];
  participant: any[];
  reward: string;
  image_url: string;
  participantCount?: number;
  userApplicationStatus?: {
    hasApplied: boolean;
    method?: "WILL_JOIN" | "INTERESTED";
    isParticipated?: boolean;
    appliedAt?: string;
  };
}

export interface AppliedEventSummary {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  city: string;
  status: EventStatus;
  reward: string;
  image_url: string;
}

export interface AppliedEvent {
  eventId: ID;
  method: "WILL_JOIN" | "INTERESTED";
  isParticipated: boolean;
  appliedAt: string;
  event: AppliedEventSummary;
}

export interface Sponsorship {
  id: ID;
  eventId: ID;
  amount_donation: number;
  description: string;
  sponsorType: string;
  status: SponsorshipStatus;
}

export interface EventSponsor {
  _id: ID;
  id?: ID;
  userId: string;
  eventId: ID;
  sponsorType: string; // "AMOUNT" | "DONATION"
  amount?: number | null;
  donationAmount?: number | null;
  donation?: string | null;
  description: string;
  approvedStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorshipRequest {
  userId: string;
  eventId: string;
  sponsorType: string; // "AMOUNT" | "DONATION"
  amount?: number; // for AMOUNT
  donationAmount?: number; // for DONATION (optional)
  donation?: string; // for DONATION (optional)
  description: string;
}

export interface Sponsorship {
  _id: string;
  id: string;
  userId: string;
  eventId: string;
  sponsorType:  string; 
  amount: number;
  donationAmount: number | null;
  donation: string | null;
  description: string;
  approvedStatus: "APPROVED" | "PENDING" | "REJECTED" | string; 
  createdAt: string; 
  updatedAt: string; 
}

export interface SponsorshipForm {
  sponsorType: string; // "AMOUNT" | "DONATION"
  amount?: string;
  donationAmount?: string;
  donation?: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerification {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  tokenUser: TokenUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface CreateEventForm {
  eventTitle: string;
  eventType: string;
  eventDescription: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  reward: string;
  image_url?: string;
}

export interface CreateEventRequest {
  eventTitle: string;
  eventType: string;
  eventDescription: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  province:string;
  city: string;
  reward: string;
  longitude: number;
  latitude: number;
}

export interface EventLocation {
  displayName: string;
  longitude: number;
  latitude: number;
}

export type LoadingState = "idle" | "loading" | "succeeded" | "failed";

export interface AsyncState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export interface AsyncArrayState<T = any> {
  data: T[];
  loading: LoadingState;
  error: string | null;
}

// Leaderboard types
export interface LeaderboardEntry {
  email: string;
  name: string;
  points: number;
  livingCity: string;
  rank: number;
  globalRank: number;
  cityRank: number;
}

export interface LeaderboardResponse {
  scope: string;
  city: string;
  total: number;
  skip: number;
  limit: number;
  results: LeaderboardEntry[];
}

export interface LeaderboardFilters {
  city: string;
  limit: number;
  search?: string;
}

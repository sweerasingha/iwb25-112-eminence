export enum Roles {
  ADMIN = "ADMIN",
  ADMIN_OPERATOR = "ADMIN_OPERATOR",
  SUPER_ADMIN = "SUPER_ADMIN",
  USER = "USER",
  PREMIUM_PENDING = "PREMIUM_PENDING",
  PREMIUM_USER = "PREMIUM_USER",
}

export interface User {
  email: string;
  role: Roles;
  token: string;
}
export interface CustomJwtPayload {
  sub: string;
  role: Roles;
  exp?: number;
}

export interface UserSession {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ApiResponse {
  status: boolean;
  data?: any;
}

export interface ProvincialAdmin {
  _id?: { $oid: string };
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  province: string;
  verified?: boolean;
}

export interface AdminOperator {
  _id?: { $oid: string };
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  city: string;
  verified?: boolean;
}

export interface Event {
  _id: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  eventTitle: string;
  eventType: string;
  eventDescription: string;
  createdBy: string;
  approvedBy: string | null;
  status: string;
  sponsor: any[];
  participant: string[];
  reward: string;
  image_url: string;
}

export interface PointsConfig {
  eventCreationPoints: number;
  eventCompletionBonusPoints: number;
  eventApprovalBonusPoints: number;
  sponsorshipBonusPoints: number;
  allowNegativeBalance: boolean;
  maxDailyPointsPerUser: number;
}

export interface PointsAdjustment {
  userEmail: string;
  pointsAdjustment: number;
  reason: string;
}

export interface UserSearchParams {
  name?: string;
  role?: string;
  limit?: number;
  skip?: number;
}

export interface AnalyticsDateRange {
  startDate?: string;
  endDate?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: any;
}

export interface AuditPagination {
  limit?: number;
  skip?: number;
}

export interface PremiumUserRequest {
  _id: {
    $oid: string;
  };
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  verified: boolean;
}

export interface Sponsor {
  _id: string;
  id: string;
  userId: string;
  eventId: string;
  sponsorType: string;
  amount: number;
  donationAmount: number | null;
  donation: string | null;
  description: string;
  approvedStatus: string;
  createdAt: string;
  updatedAt: string;
}


export interface EventLocation {
  displayName: string;
  longitude: number;
  latitude: number;
}
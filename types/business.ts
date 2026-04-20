export interface BusinessContext {
  business_id: string;
  member_id: string;
  roles: string[];
  permissions: string[];
}

export interface UserProfile {
  user_id: string;
  email: string;
  roles: string[];
  permissions: string[];
  businesses?: BusinessContext[];
}

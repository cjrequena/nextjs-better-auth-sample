import type { BusinessContext } from "./business";

/** Shape of useSession().data returned by the auth-client */
export interface EnrichedSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Custom fields — stored as JSON strings in the DB
    roles: string;
    permissions: string;
    businesses: string;
    activeBusiness: string;
  };
}

/** Parsed form of the JSON string session fields */
export interface ParsedSessionFields {
  roles: string[];
  permissions: string[];
  businesses: BusinessContext[];
  activeBusiness: string;
}

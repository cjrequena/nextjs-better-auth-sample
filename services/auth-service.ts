const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:8080";
const AUTH_SERVICE_VERSION = process.env.AUTH_SERVICE_API_VERSION ?? "application/vnd.auth-service.v1";

const headers = {
  "Content-Type": "application/json",
  "Accept-Version": AUTH_SERVICE_VERSION,
};

export interface UserProfile {
  user_id: string;
  email: string;
  platform_roles: string[];
  platform_permissions: string[];
  businesses?: string[];
}

export async function registerUser(userId: string, email: string) {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: userId, email }),
  });
  if (!res.ok && res.status !== 409) {
    console.error("[AUTH-SERVICE] Failed to create user:", await res.text());
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const res = await fetch(
    `${AUTH_SERVICE_URL}/api/users/me?user_id=${userId}`,
    { headers: { "Accept-Version": AUTH_SERVICE_VERSION } },
  );
  if (!res.ok) return null;
  return res.json();
}

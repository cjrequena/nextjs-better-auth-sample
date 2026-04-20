export type { BusinessContext, UserProfile } from "@/types/business";
import type { UserProfile } from "@/types/business";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:8080";
const AUTH_SERVICE_VERSION = process.env.AUTH_SERVICE_API_VERSION ?? "application/vnd.auth-service.v1";

const headers = {
  "Content-Type": "application/json",
  "Accept-Version": AUTH_SERVICE_VERSION,
};

export async function createUser(userId: string, email: string) {
  const response: Response = await fetch(`${AUTH_SERVICE_URL}/api/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: userId, email }),
  });
  if (!response.ok && response.status !== 409) {
    console.error("[AUTH-SERVICE] Failed to create user:", await response.text());
  }
}

export async function me(userId: string): Promise<UserProfile | null> {
  const url = `${AUTH_SERVICE_URL}/api/users/me?user_id=${userId}`;
  console.log("[AUTH-SERVICE] GET", url);
  const response: Response = await fetch(url, {
    headers: { "Accept-Version": AUTH_SERVICE_VERSION },
  });
  console.log("[AUTH-SERVICE] status:", response.status);
  if (!response.ok) {
    console.error("[AUTH-SERVICE] me failed:", response.status, await response.text());
    return null;
  }
  const data = await response.json();
  console.log("[AUTH-SERVICE] me response:", JSON.stringify(data, null, 2));
  return data;
}

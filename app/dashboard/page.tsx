"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  const { user } = session;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="card bg-base-200 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">Profile</h2>
          <div className="flex items-center gap-4 mt-2">
            {user.image && (
              <div className="avatar">
                <div className="w-16 rounded-full">
                  <img src={user.image} alt={user.name || "Avatar"} />
                </div>
              </div>
            )}
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm opacity-70">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">Session Details</h2>
          <pre className="text-xs overflow-auto mt-2 p-3 bg-base-300 rounded-lg max-h-64">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>

      <button className="btn btn-error" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}

"use client";

import {signOut, useSession, authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useAuth} from "@/lib/auth-provider";
import {HasPermission} from "@/components/auth/HasPermission";
import {HasRole} from "@/components/auth/HasRole";

export default function DashboardPage() {
    const {data: session, isPending} = useSession();
    const {roles, permissions, businesses, activeBusiness, setActiveBusiness} = useAuth();
    const router = useRouter();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [jwtError, setJwtError] = useState<string | null>(null);

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/signin");
        }
    }, [isPending, session, router]);

    async function fetchJwt() {
        setJwtError(null);
        try {
            const {data, error} = await authClient.token();
            if (error) {
                setJwtError(error.message ?? "Failed to retrieve token");
                return;
            }
            setJwtToken(data?.token ?? null);
        } catch (e) {
            setJwtError(e instanceof Error ? e.message : "Unknown error");
        }
    }

    function decodeJwtPayload(token: string): Record<string, unknown> | null {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return null;
            const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
            return JSON.parse(payload);
        } catch {
            return null;
        }
    }

    if (isPending) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg"/>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const {user} = session;

    async function handleSignOut() {
        await signOut();
        router.push("/");
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* ── Profile ──────────────────────────────────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Profile</h2>
                    <div className="flex items-center gap-4 mt-2">
                        {user.image && (
                            <div className="avatar">
                                <div className="w-16 rounded-full">
                                    <img src={user.image} alt={user.name || "Avatar"}/>
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

            {/* ── Auth Context Debug ───────────────────────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Auth Context (aggregated)</h2>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div>
                            <p className="font-semibold mb-1">Roles</p>
                            <div className="flex flex-wrap gap-1">
                                {roles.length > 0
                                    ? roles.map((r) => (
                                        <span key={r} className="badge badge-primary badge-sm">{r}</span>
                                    ))
                                    : <span className="opacity-50">none</span>}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Permissions</p>
                            <div className="flex flex-wrap gap-1">
                                {permissions.length > 0
                                    ? permissions.map((p) => (
                                        <span key={p} className="badge badge-secondary badge-sm">{p}</span>
                                    ))
                                    : <span className="opacity-50">none</span>}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Active Business</p>
                            <code className="text-xs">{activeBusiness || "none"}</code>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Businesses</p>
                            <code className="text-xs">{businesses.length} membership(s)</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Business Context & Switcher ────────────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Business Context</h2>

                    {businesses.length === 0 ? (
                        <p className="text-sm opacity-50 italic">No business memberships found.</p>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mt-2 mb-4">
                                <label className="text-sm font-semibold" htmlFor="business-switcher">
                                    Active Business:
                                </label>
                                <select
                                    id="business-switcher"
                                    className="select select-bordered select-sm"
                                    value={activeBusiness}
                                    onChange={(e) => setActiveBusiness(e.target.value)}
                                >
                                    {businesses.map((b) => (
                                        <option key={b.business_id} value={b.business_id}>
                                            {b.business_id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="divider my-1"/>

                            {businesses.map((b) => {
                                const isActive = b.business_id === activeBusiness;
                                return (
                                    <div
                                        key={b.business_id}
                                        className={`rounded-lg p-3 mb-3 ${isActive ? "bg-primary/10 border border-primary/30" : "bg-base-300"}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <code className="text-xs font-mono">{b.business_id}</code>
                                            {isActive && <span className="badge badge-primary badge-xs">active</span>}
                                        </div>
                                        <div className="text-xs mb-1 opacity-60">
                                            member: <code>{b.member_id}</code>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xs font-semibold mb-1">Business Roles</p>
                                            <div className="flex flex-wrap gap-1">
                                                {b.roles.length > 0
                                                    ? b.roles.map((r) => (
                                                        <span key={r} className="badge badge-accent badge-sm">{r}</span>
                                                    ))
                                                    : <span className="text-xs opacity-50">none</span>}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xs font-semibold mb-1">Business Permissions</p>
                                            <div className="flex flex-wrap gap-1">
                                                {b.permissions.length > 0
                                                    ? b.permissions.map((p) => (
                                                        <span key={p} className="badge badge-ghost badge-sm">{p}</span>
                                                    ))
                                                    : <span className="text-xs opacity-50">none</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {/* ── Layer 2 Examples: HasPermission ──────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Layer 2 — RequirePermission</h2>
                    <p className="text-sm opacity-70 mb-4">
                        These sections render only if you have the matching permission.
                    </p>

                    <HasPermission permission={["booking:read", "booking:write"]} operator="some"
                        fallback={<p className="text-sm opacity-50 italic">🔒 booking:read — not granted</p>}
                    >
                        <div className="alert alert-success mb-2">
                            <span>✅ You can view booking (booking:read)</span>
                        </div>
                    </HasPermission>

                    <HasPermission
                        permission="booking:write"
                        fallback={<p className="text-sm opacity-50 italic">🔒 booking:write — not granted</p>}
                    >
                        <div className="alert alert-success mb-2">
                            <span>✅ You can create/edit booking (booking:write)</span>
                        </div>
                    </HasPermission>

                    <HasPermission
                        permission="billing:read"
                        fallback={<p className="text-sm opacity-50 italic">🔒 billing:read — not granted</p>}
                    >
                        <div className="alert alert-success mb-2">
                            <span>✅ You can manage billing (billing:read)</span>
                        </div>
                    </HasPermission>

                    <HasPermission
                        permission="staff:invite"
                        fallback={<p className="text-sm opacity-50 italic">🔒 staff:invite — not granted</p>}
                    >
                        <button className="btn btn-primary btn-sm mt-2">
                            Invite Staff Member
                        </button>
                    </HasPermission>
                </div>
            </div>

            {/* ── Layer 2 Examples: HasRole ─────────────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Layer 2 — RequireRole</h2>
                    <p className="text-sm opacity-70 mb-4">
                        These sections render only if you have the matching role.
                    </p>

                    <HasRole
                        role="PLATFORM_ADMIN"
                        fallback={<p className="text-sm opacity-50 italic">🔒 PLATFORM_ADMIN — not your role</p>}
                    >
                        <div className="alert alert-warning mb-2">
                            <span>⚙️ Platform Admin Panel — manage all users and clinics</span>
                        </div>
                    </HasRole>

                    <HasRole
                        role="CLINIC_OWNER"
                        fallback={<p className="text-sm opacity-50 italic">🔒 CLINIC_OWNER — not your role</p>}
                    >
                        <div className="alert alert-info mb-2">
                            <span>🏥 Clinic Settings — configure your clinic</span>
                        </div>
                    </HasRole>

                    <HasRole
                        role="PRACTITIONER"
                        fallback={<p className="text-sm opacity-50 italic">🔒 PRACTITIONER — not your role</p>}
                    >
                        <div className="alert alert-info mb-2">
                            <span>🩺 My Schedule — view and manage your booking</span>
                        </div>
                    </HasRole>

                    <HasRole
                        role="RECEPTIONIST"
                        fallback={<p className="text-sm opacity-50 italic">🔒 RECEPTIONIST — not your role</p>}
                    >
                        <div className="alert alert-info mb-2">
                            <span>📋 Front Desk — check-in patients and manage walk-ins</span>
                        </div>
                    </HasRole>
                </div>
            </div>

            {/* ── JWT Token (for downstream services) ──────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">JWT Token</h2>
                    <p className="text-sm opacity-70 mb-3">
                        This is the token passed to downstream services (e.g. auth-service, booking-service).
                    </p>

                    <button className="btn btn-outline btn-sm mb-3 w-fit" onClick={fetchJwt}>
                        {jwtToken ? "Refresh Token" : "Get Token"}
                    </button>

                    {jwtError && (
                        <div className="alert alert-error mb-2">
                            <span>{jwtError}</span>
                        </div>
                    )}

                    {jwtToken && (
                        <>
                            <div className="mb-3">
                                <p className="text-xs font-semibold mb-1">Raw Token</p>
                                <pre
                                    className="text-xs overflow-auto p-3 bg-base-300 rounded-lg max-h-32 break-all whitespace-pre-wrap">
                  {jwtToken}
                </pre>
                            </div>

                            <div>
                                <p className="text-xs font-semibold mb-1">Decoded Payload</p>
                                <pre className="text-xs overflow-auto p-3 bg-base-300 rounded-lg max-h-64">
                  {JSON.stringify(decodeJwtPayload(jwtToken), null, 2)}
                </pre>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Session Details ──────────────────────────────────── */}
            <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title">Session Details (raw)</h2>
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

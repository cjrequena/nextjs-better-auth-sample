"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    const { error } = await resetPassword({ newPassword: password, token });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to reset password");
      return;
    }

    router.push("/signin");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}
      <input
        type="password"
        placeholder="New password"
        className="input input-bordered w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <input
        type="password"
        placeholder="Confirm new password"
        className="input input-bordered w-full"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        minLength={8}
        required
      />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? <span className="loading loading-spinner loading-sm" /> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-20 px-4">
      <div className="card bg-base-200 shadow-lg w-full max-w-sm">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Reset Password</h2>
          <Suspense fallback={<span className="loading loading-spinner loading-sm mx-auto" />}>
            <ResetPasswordForm />
          </Suspense>
          <p className="text-center text-sm mt-4">
            <Link href="/signin" className="link link-primary">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

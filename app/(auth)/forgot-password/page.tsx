"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to send reset email");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20 px-4">
      <div className="card bg-base-200 shadow-lg w-full max-w-sm">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Forgot Password</h2>

          {submitted ? (
            <div className="alert alert-success text-sm">
              <span>If an account exists for that email, a reset link has been sent.</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm mt-4">
            <Link href="/signin" className="link link-primary">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

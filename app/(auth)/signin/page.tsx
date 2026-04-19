"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Sign in failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20 px-4">
      <div className="card bg-base-200 shadow-lg w-full max-w-sm">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Sign In</h2>

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
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-2">
            <Link href="/forgot-password" className="link link-primary">Forgot password?</Link>
          </p>
          <p className="text-center text-sm mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="link link-primary">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

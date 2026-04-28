"use client";

import Link from "next/link";
import {signOut, useSession} from "@/lib/auth-client";
import {useRouter} from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 lg:px-8">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            {user && <li><Link href="/dashboard">Dashboard</Link></li>}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          🏥 ClinicHub
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
          {user && <li><Link href="/dashboard">Dashboard</Link></li>}
        </ul>
      </div>
      <div className="navbar-end gap-2">
        {user ? (
          <>
            <span className="text-sm hidden sm:inline">{user.name || user.email}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/signin" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}

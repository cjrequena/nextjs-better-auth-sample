import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero min-h-[70vh] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-tight">
            The All-in-One Platform for <span className="text-primary">Healthcare Clinics</span>
          </h1>
          <p className="py-6 text-lg text-base-content/70">
            Purpose-built SaaS for aesthetics centers, dermatology, physical therapy, dental clinics, and clinic hubs.
            Streamline scheduling, patient management, billing, and more.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
            <a href="#services" className="btn btn-outline">Explore Services</a>
          </div>
        </div>
      </div>
    </section>
  );
}

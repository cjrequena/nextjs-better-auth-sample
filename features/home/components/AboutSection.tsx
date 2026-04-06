export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-base-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">About Us</h2>
        <p className="text-lg text-base-content/70 mb-8">
          ClinicHub is a vertical SaaS platform designed exclusively for healthcare professionals.
          We understand the unique workflows of aesthetics centers, dental practices, dermatology offices,
          and physical therapy clinics — and we built our platform around them.
        </p>
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-value text-primary">500+</div>
            <div className="stat-desc">Clinics Onboarded</div>
          </div>
          <div className="stat">
            <div className="stat-value text-primary">50K+</div>
            <div className="stat-desc">Appointments Monthly</div>
          </div>
          <div className="stat">
            <div className="stat-value text-primary">99.9%</div>
            <div className="stat-desc">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

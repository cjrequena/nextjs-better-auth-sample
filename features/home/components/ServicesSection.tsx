const services = [
  { icon: "💉", title: "Medical Aesthetics", desc: "Botox, dermal fillers, PRP therapy, and anti-aging treatments." },
  { icon: "✨", title: "Laser & Skin Care", desc: "Laser hair removal, skin resurfacing, facials, and chemical peels." },
  { icon: "🦷", title: "Dental Clinics", desc: "Implants, orthodontics, whitening, and general dentistry." },
  { icon: "🩺", title: "Dermatology", desc: "Clinical dermatology, mole checks, acne treatment, and skin biopsies." },
  { icon: "🏋️", title: "Physical Therapy", desc: "Rehabilitation, sports therapy, manual therapy, and pain management." },
  { icon: "🏥", title: "Clinic Hub Management", desc: "Multi-location scheduling, unified billing, staff management, and analytics." },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 bg-base-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="card bg-base-200 shadow-sm">
              <div className="card-body items-center text-center">
                <span className="text-4xl">{s.icon}</span>
                <h3 className="card-title">{s.title}</h3>
                <p className="text-base-content/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 bg-base-100">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" className="input input-bordered w-full" />
          <input type="email" placeholder="Email" className="input input-bordered w-full" />
          <textarea className="textarea textarea-bordered w-full" placeholder="Your message" rows={4} />
          <button type="submit" className="btn btn-primary w-full">Send Message</button>
        </form>
      </div>
    </section>
  );
}

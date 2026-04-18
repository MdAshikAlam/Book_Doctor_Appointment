export default function About() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8">About BookMyDoctor</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          We are dedicated to revolutionizing the way you access healthcare. Our platform connects patients with top-tier medical professionals, ensuring that quality care is always within reach.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-500">To make quality healthcare accessible, affordable, and transparent for everyone everywhere.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-500">A world where navigating healthcare is simple and healthcare choices are data-driven.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Our Values</h3>
            <p className="text-gray-500">Patient-first care, integrity, transparency, and innovation in medical technology.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

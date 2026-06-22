// 📁 components/Hero.tsx
import useDocumentTitle from "../hooks/useDocumentTitle";

function Hero() {
  useDocumentTitle(" Powered By");
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div>
          <p className="text-red-500 font-semibold uppercase tracking-widest mb-4">
            Interior Design In Bewari
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-black">
            Premium Interiors
            <br />
            <span className="text-red-500">
              Designed For Bewari Homes
            </span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg leading-8 max-w-lg">
            Kiwi Interiors creates beautiful, modern, and comfortable spaces
            specially crafted for families and homes in Bewari. From bedrooms
            to luxury living rooms, we turn ideas into elegant interiors.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="bg-red-500 hover:bg-red-600 text-white px-7 py-4 rounded-xl font-semibold transition">
              Explore Interiors
            </button>

            <button className="border border-red-500 text-red-500 hover:bg-red-50 px-7 py-4 rounded-xl font-semibold transition">
              Contact Us
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div>
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
            alt="Bewari Interior Design"
            className="rounded-[40px] shadow-xl w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
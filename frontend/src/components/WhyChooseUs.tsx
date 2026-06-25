import { ReactElement } from "react";

// 🛡️ TYPE SPECIFICATION FOR THE INTERFACE
interface BenefitItem {
  title: string;
  desc: string;
  icon: string; // 👈 Har card ke liye alag visual context icon
}

const benefits: BenefitItem[] = [
  {
    title: "Local Bhiwani Expertise",
    desc: "Kiwi Interiors understands the home style, spatial dynamics, and interior needs of families in Bhiwani.",
    icon: "🏢",
  },
  {
    title: "Affordable Packages",
    desc: "Beautiful premium interiors designed meticulously for every budget scale without compromising quality.",
    icon: "💎",
  },
  {
    title: "Modern Designs",
    desc: "Stylish, highly functional, and comfortable interiors perfectly crafted for contemporary living spaces.",
    icon: "📐",
  },
  {
    title: "Trusted Service",
    desc: "From blueprint planning to final execution, Kiwi Interiors supports you seamlessly at every step.",
    icon: "🛡️",
  },
];

function WhyChooseUs(): ReactElement {
  return (
    <section className="bg-red-50/50 py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🔝 Strategic Heading Section */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-red-500 font-bold uppercase tracking-widest text-xs md:text-sm">
            Why Choose Us
          </p>

          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
            Best Interior Service in Bhiwani
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
            Kiwi Interiors brings modern, luxury, and elegant interior design solutions 
            specially crafted for modern homes and creative commercial spaces.
          </p>
        </div>

        {/* 🎴 Advanced Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((item: BenefitItem, index: number) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col items-start"
            >
              {/* 🏷️ Icon Badge Wrapper */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-50 flex items-center justify-center text-xl md:text-2xl mb-5 border border-red-100/50">
                {item.icon}
              </div>

              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>

              <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
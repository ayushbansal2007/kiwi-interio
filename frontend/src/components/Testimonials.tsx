import { ReactElement } from "react";

// 🛡️ TYPE INTERFACE FOR REVIEWS
interface ReviewItem {
  name: string;
  city: string;
  review: string;
}

const reviews: ReviewItem[] = [
  {
    name: "Rahul Sharma",
    city: "Bhiwani", // 👈 Agar ye Haryana ka area hai toh perfect, standard nomenclature
    review:
      "Kiwi Interiors completely changed our living room. The design feels modern, spacious, and extremely premium.",
  },
  {
    name: "Priya Verma",
    city: "Bhiwani",
    review:
      "Very smooth experience from planning to execution. Loved their material quality and interior styling.",
  },
  {
    name: "Amit Yadav",
    city: "Bhiwani",
    review:
      "Affordable pricing and beautiful interior ideas. Highly recommended studio for workspace and home designs.",
  },
];

function Testimonials(): ReactElement {
  return (
    <section className="bg-white py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🔝 Heading Zone */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-red-500 uppercase tracking-widest text-xs md:text-sm font-bold">
            Client Reviews
          </p>

          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
            What Our Clients Say
          </h2>
          <div className="w-12 h-1 bg-red-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 🎴 Responsive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((item: ReviewItem, index: number) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
            >
              <div>
                {/* ⭐ Premium Star Ratings & Quote Accent */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1 text-amber-500 text-sm">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-gray-200 text-4xl font-serif leading-none">“</span>
                </div>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 italic">
                  "{item.review}"
                </p>
              </div>

              {/* 👤 User Metadata */}
              <div className="border-t border-gray-200/60 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-sm border border-red-100">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs font-medium">
                    📍 {item.city} Resident
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
// 📁 components/Testimonials.tsx

const reviews = [
  {
    name: "Rahul Sharma",
    city: "Bewari",
    review:
      "Kiwi Interiors completely changed our living room. The design feels modern and premium.",
  },
  {
    name: "Priya Verma",
    city: "Bewari",
    review:
      "Very smooth experience from planning to execution. Loved the interior styling.",
  },
  {
    name: "Amit Yadav",
    city: "Bewari",
    review:
      "Affordable pricing and beautiful interior ideas. Highly recommended in Bewari.",
  },
];

function Testimonials() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-red-500 uppercase tracking-widest font-semibold">
            Client Reviews
          </p>

          <h2 className="text-4xl font-bold text-black mt-3">
            What Bewari Clients Say
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((item, index) => (
            <div
              key={index}
              className="bg-red-50 rounded-3xl p-8 shadow-sm hover:shadow-lg transition"
            >
              <p className="text-gray-600 leading-8 mb-6">
                "{item.review}"
              </p>

              <div>
                <h3 className="text-xl font-semibold text-black">
                  {item.name}
                </h3>

                <p className="text-red-500 text-sm">
                  {item.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
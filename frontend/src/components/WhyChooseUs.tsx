// 📁 components/WhyChooseUs.tsx

const benefits = [
  {
    title: "Local Bewari Expertise",
    desc: "Kiwi Interiors understands the home style and interior needs of families in Bewari.",
  },
  {
    title: "Affordable Packages",
    desc: "Beautiful interiors designed for every budget without compromising quality.",
  },
  {
    title: "Modern Designs",
    desc: "Stylish and comfortable interiors made for modern living spaces.",
  },
  {
    title: "Trusted Service",
    desc: "From planning to execution, Kiwi Interiors supports you at every step.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-red-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-red-500 font-semibold uppercase tracking-widest">
            Why Choose Us
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-black mt-3">
            Best Interior Service in Bewari
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mt-5 leading-8">
            Kiwi Interiors brings modern and elegant interior design solutions
            specially crafted for homes and spaces in Bewari.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl mb-5">
                ✦
              </div>

              <h3 className="text-xl font-semibold text-black mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-7">
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
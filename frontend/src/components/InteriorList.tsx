import {
  useEffect,
  useMemo,
  useState,
} from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface Interior {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  subcategory: string;
  style: string;
  roomType: string;
  tags: string[];
}

function InteriorList() {
useDocumentTitle("Interiors");
  
  const [
    interiors,
    setInteriors,
  ] = useState<
    Interior[]
  >([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    "All"
  );

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(8);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    const fetchInteriors =
      async () => {

        try {

          const res =
            await fetch(
              "https://kiwi-interio.onrender.com/api/interiors"
            );

          const data =
            await res.json();

          setInteriors(
            data
          );

        } catch (
          error
        ) {

          console.log(
            error
          );

        } finally {

          setLoading(
            false
          );
        }
      };

    fetchInteriors();

  }, []);

  // unique categories

  const categories =
    useMemo(
      () => [
        "All",

        ...new Set(
          interiors.map(
            (
              item
            ) =>
              item.category
          )
        ),
      ],

      [interiors]
    );

  // filtered data

  const filteredInteriors =
    useMemo(
      () =>
        selectedCategory ===
        "All"

          ? interiors

          : interiors.filter(
              (
                item
              ) =>
                item.category ===
                selectedCategory
            ),

      [
        interiors,
        selectedCategory,
      ]
    );

  const visibleInteriors =
    filteredInteriors.slice(
      0,
      visibleCount
    );

  return (
    <section className="bg-gradient-to-b from-red-50 via-white to-white min-h-screen px-6 py-20">

      <div className="max-w-7xl mx-auto">

        {/* heading */}

        <div className="text-center mb-14">

          <span className="bg-red-100 text-red-500 px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-widest">

            Premium Interiors

          </span>

          <h2 className="text-5xl font-bold mt-6 text-gray-900">

            Discover Your
            {" "}
            <span className="text-red-500">

              Dream Interior

            </span>

          </h2>

          <p className="text-gray-500 mt-4 text-lg">

            Explore luxury,
            modern and elegant
            interiors crafted
            for your home.

          </p>

        </div>

        {/* category buttons */}

        <div className="flex flex-wrap justify-center gap-4 mb-14">

          {categories.map(
            (
              category,
              index
            ) => (

              <button
                key={
                  index
                }

                onClick={() => {

                  setSelectedCategory(
                    category
                  );

                  setVisibleCount(
                    8
                  );
                }}

                className={`px-6 py-3 rounded-full text-sm font-semibold capitalize transition-all duration-300 border

                ${
                  selectedCategory ===
                  category

                    ? "bg-red-500 text-white border-red-500 shadow-lg scale-105"

                    : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-500 hover:shadow-md"
                }`}
              >

                {
                  category
                }

              </button>
            )
          )}

        </div>

        {/* loading skeleton */}

        {loading ? (

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

            {Array.from({
              length: 8,
            }).map(
              (
                _,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className="bg-white rounded-[30px] overflow-hidden shadow animate-pulse"
                >

                  <div className="h-72 bg-gray-200" />

                  <div className="p-5 space-y-4">

                    <div className="w-20 h-5 bg-gray-200 rounded-full" />

                    <div className="w-44 h-6 bg-gray-200 rounded" />

                    <div className="w-full h-4 bg-gray-200 rounded" />

                    <div className="w-2/3 h-4 bg-gray-200 rounded" />

                  </div>

                </div>
              )
            )}

          </div>

        ) : (

          <>
            {/* cards */}

            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

              {visibleInteriors.map(
                (
                  item
                ) => (

                  <div
                    key={
                      item._id
                    }

                    className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >

                    {/* image */}

                    <div className="relative overflow-hidden">

                      <img
                        src={
                          item.image
                        }

                        alt={
                          item.title
                        }

                        loading="lazy"

                        className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                      />

                      {/* style badge */}

                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-red-500 px-4 py-2 rounded-full text-xs font-bold capitalize shadow-md">

                        {
                          item.style
                        }

                      </span>

                    </div>

                    <div className="p-6">

                      {/* category */}

                      <p className="uppercase text-xs font-bold tracking-widest text-red-500 mb-2">

                        {
                          item.category
                        }

                        {" • "}

                        {
                          item.subcategory
                        }

                      </p>

                      {/* title */}

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">

                        {
                          item.title
                        }

                      </h3>

                      {/* desc */}

                      <p className="text-gray-500 text-sm leading-7 line-clamp-2 mb-5">

                        {
                          item.description
                        }

                      </p>

                      {/* tags */}

                      <div className="flex flex-wrap gap-2 mb-6">

                        {item.tags
                          ?.slice(
                            0,
                            3
                          )
                          .map(
                            (
                              tag,
                              index
                            ) => (

                              <span
                                key={
                                  index
                                }

                                className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full"
                              >

                                #
                                {
                                  tag
                                }

                              </span>
                            )
                          )}

                      </div>

                      {/* footer */}

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-xs text-gray-400">

                            Starting From

                          </p>

                          <h4 className="text-2xl font-bold text-red-500">

                            ₹
                            {
                              item.price
                            }

                          </h4>

                        </div>

                        <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold transition shadow-lg hover:scale-105">

                          Buy Now

                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

            {/* pagination */}

            {visibleCount <
              filteredInteriors.length && (

              <div className="flex justify-center mt-16">

                <button

                  onClick={() =>
                    setVisibleCount(
                      (
                        prev
                      ) =>
                        prev +
                        8
                    )
                  }

                  className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-full font-semibold shadow-xl transition hover:scale-105"
                >

                  Load More

                </button>

              </div>
            )}
          </>
        )}

      </div>

    </section>
  );
}

export default
  InteriorList;
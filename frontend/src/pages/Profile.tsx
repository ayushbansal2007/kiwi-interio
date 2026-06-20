// 📁 src/pages/Profile.tsx

import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  number: string;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://kiwi-interio.onrender.com/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-6 py-16">
      <div className="bg-white shadow-2xl rounded-[40px] overflow-hidden w-full max-w-5xl grid md:grid-cols-2">

        {/* Left Side */}
        <div className="bg-red-500 text-white p-10 flex flex-col justify-center items-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png"
            alt="Profile"
            className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-6 z-10"
          />

          <h2 className="text-3xl font-bold z-10">
            Welcome to Kiwi Interiors
          </h2>

          <p className="mt-4 text-center leading-7 text-red-100 max-w-sm z-10">
            Your personal profile dashboard for managing your Kiwi Interiors experience in Bewari.
          </p>
        </div>

        {/* Right Side */}
        <div className="p-10 md:p-14">
          <div className="mb-10">
            <p className="text-red-500 uppercase tracking-widest font-semibold">
              My Account
            </p>

            <h1 className="text-4xl font-bold text-black mt-2">
              Profile Details
            </h1>
          </div>

          {user ? (
            <div className="space-y-8">
              {/* Name */}
              <div className="bg-red-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-1">
                  Full Name
                </p>

                <h2 className="text-2xl font-semibold text-black">
                  {user.name}
                </h2>
              </div>

              {/* Email */}
              <div className="bg-red-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-1">
                  Email Address
                </p>

                <h2 className="text-2xl font-semibold text-black">
                  {user.email}
                </h2>
              </div>

              {/* Phone */}
              <div className="bg-red-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-1">
                  Phone Number
                </p>

                <h2 className="text-2xl font-semibold text-black">
                  {user.number}
                </h2>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Loading profile...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
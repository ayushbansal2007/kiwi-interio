// 📁 pages/Register.tsx

import { useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";



function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
  });

  useDocumentTitle("Register");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";
  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const response = await fetch(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Registered Successfully");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-3xl shadow-lg w-[450px]"
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          Register
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-4 rounded-xl mb-4"
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-4 rounded-xl mb-4"
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-4 rounded-xl mb-4"
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-4 rounded-xl mb-6"
          onChange={(e) =>
            setFormData({
              ...formData,
              number: e.target.value,
            })
          }
        />

        <button className="w-full bg-red-500 text-white py-4 rounded-xl">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
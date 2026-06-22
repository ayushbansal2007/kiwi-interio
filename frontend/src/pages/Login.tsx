// 📁 pages/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomePopup from "../components/WelcomePopup";
import useDocumentTitle from "../hooks/useDocumentTitle";



function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);

useDocumentTitle("Login");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://kiwi-interio.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // Show Welcome Popup
        setShowPopup(true);

        // Redirect after popup
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2500);
      } else {
        alert("Invalid Email or Password");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 relative">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-3xl shadow-lg w-[400px]"
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-4 rounded-xl mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-4 rounded-xl mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl transition">
          Login
        </button>
      </form>

      {/* Welcome Popup */}
      <WelcomePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
}

export default Login;
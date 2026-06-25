import { Routes, Route } from "react-router-dom";

import Hero from "./components/Hero";
import InteriorList from "./components/InteriorList";
import Navbar from "./components/Navbar";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AIAssistant from "./pages/AIAssistant";
import ContactQuery from "./pages/ContactQuery"; // 👈 Hamara floating code import kiya
import InteriorDetailPage from "./pages/InteriorDetailPage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <InteriorList />
              <WhyChooseUs />
              <Testimonials />
            </>
          }
        />

        {/* Auth & Feature Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/interiors" element={<InteriorList />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/interior/:id" element={<InteriorDetailPage />} /> 
      </Routes>
      

      {/* 🎯 GLOBAL FLOATING LAYER */}
      {/* Ye Routes ke bahaar hai, isliye har page par right-bottom me floating dikhega */}
      <ContactQuery />
    </>
  );
}

export default App;
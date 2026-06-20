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

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />}/>
        <Route path="/admin" element={<Admin />}/>
        <Route path="/interiors" element={<InteriorList />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Routes>
    </>
  );
}

export default App;
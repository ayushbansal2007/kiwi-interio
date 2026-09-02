import { Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Hero from "./components/Hero";
import InteriorList from "./components/InteriorList";
import Navbar from "./components/Navbar";
import Testimonials from "./components/Testimonials";
import WhyChooseUs from "./components/WhyChooseUs";
import Admin from "./pages/Admin";
import AIAssistant from "./pages/AIAssistant";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactQuery from "./pages/ContactQuery";
import InteriorDetailPage from "./pages/InteriorDetailPage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <InteriorList />
              <WhyChooseUs />
              <Testimonials />
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/interiors" element={<InteriorList />} />
        <Route path="/interior/:id" element={<InteriorDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Routes>

      <ContactQuery />
    </>
  );
}

export default App;

// 📁 components/WelcomePopup.tsx

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

function WelcomePopup({
  isOpen,
  onClose,
}: WelcomePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white w-[380px] rounded-3xl shadow-2xl p-8 text-center relative animate-[fadeIn_.3s_ease]">

        {/* Cartoon Girl */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          alt="Welcome Girl"
          className="w-28 h-28 mx-auto mb-5"
        />

        {/* Heading */}
        <h2 className="text-2xl font-bold text-black mb-3">
          Namaste 👋
        </h2>

        {/* Message */}
        <p className="text-gray-600 leading-7">
          Aapka <span className="text-red-500 font-semibold">
            Kiwi Interiors
          </span>{" "}
          me swagat hai.
          <br />
          Hum aapke liye modern interior designs lekar aaye hain.
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default WelcomePopup;
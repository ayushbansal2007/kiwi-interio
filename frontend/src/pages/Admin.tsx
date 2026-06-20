import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Interior {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  subcategory: string;
  style: string;
  tags: string[];
  roomType: string;
  price: number;
}

function Admin() {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  const [interiors, setInteriors] = useState<Interior[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Predefined default categories for Kiwi Interiors
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Living Room",
    "Kitchen",
    "Bedroom",
    "Bathroom",
    "Office",
    "Dining Room"
  ]);

  const API_BASE_URL = "http://localhost:5000";

  // Fetch Data
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/interiors`)
      .then((res) => res.json())
      .then((data: Interior[]) => {
        setInteriors(data);
        
        // Extract any unique custom categories already present in database items
        const dbCategories = data.map(item => item.category).filter(Boolean);
        setAvailableCategories(prev => Array.from(new Set([...prev, ...dbCategories])));
      })
      .catch((err) => console.error("Error fetching interiors:", err));
  }, []);

  // State Handler
  const handleInputChange = (id: string, field: keyof Interior, value: any) => {
    setInteriors((prevInteriors) =>
      prevInteriors.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
  };
  

  // Handle adding a brand new category dynamically
  const handleAddNewCategory = (id: string) => {
    const newCat = prompt("Enter new Category Name:");
    if (newCat && newCat.trim() !== "") {
      const cleanCat = newCat.trim();
      if (!availableCategories.includes(cleanCat)) {
        setAvailableCategories(prev => [...prev, cleanCat]);
      }
      handleInputChange(id, "category", cleanCat);
    }
  };

  // PUT Request
  const handleUpdate = async (id: string, updatedItem: Interior) => {
    const token = localStorage.getItem("token");
    setLoadingId(id);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interior/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(updatedItem),
      });

      if (response.ok) {
        setSuccessId(id);
        setTimeout(() => setSuccessId(null), 2000);
      } else {
        alert("Database update failed.");
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Network error.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b pb-5">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Kiwi Interiors</h1>
            <p className="text-slate-500 mt-1">Granular Catalog Management & RAG Model Controller</p>
          </div>
          <span className="bg-red-100 text-red-600 font-semibold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">
            Admin Panel v2.1
          </span>
        </header>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {interiors.map((item) => (
            <div key={item._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col">
              <div className="relative">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium">
                  {item.roomType || "No Room Type"}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl transition-all outline-none text-slate-700 font-semibold"
                    onChange={(e) => handleInputChange(item._id, "title", e.target.value)}
                  />
                </div>

                {/* 3-Way Taxonomy Grid (Category Dropdown, Subcategory, Style) */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Category</label>
                    <select
                      value={item.category || ""}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2 rounded-xl text-xs outline-none h-[34px]"
                      onChange={(e) => {
                        if (e.target.value === "ADD_NEW") {
                          handleAddNewCategory(item._id);
                        } else {
                          handleInputChange(item._id, "category", e.target.value);
                        }
                      }}
                    >
                      <option value="" disabled>Select Category</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="ADD_NEW" className="text-blue-600 font-bold">+ Add Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={item.subcategory || ""}
                      placeholder="e.g. Sofa, Bed"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2 rounded-xl text-xs outline-none"
                      onChange={(e) => handleInputChange(item._id, "subcategory", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Style</label>
                    <input
                      type="text"
                      value={item.style || ""}
                      placeholder="Modern/Classic"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2 rounded-xl text-xs outline-none"
                      onChange={(e) => handleInputChange(item._id, "style", e.target.value)}
                    />
                  </div>
                </div>

                {/* Price & Room Type Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Room Type</label>
                    <input
                      type="text"
                      value={item.roomType || ""}
                      placeholder="Living Room"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl text-sm outline-none"
                      onChange={(e) => handleInputChange(item._id, "roomType", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={item.price}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl text-sm font-bold text-slate-800"
                      onChange={(e) => handleInputChange(item._id, "price", Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Tags Parser Input */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Search Keywords / Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={item.tags ? item.tags.join(", ") : ""}
                    placeholder="wooden, premium, minimal"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl text-xs outline-none font-mono"
                    onChange={(e) => {
                      const arrayTags = e.target.value.split(",").map(tag => tag.trim());
                      handleInputChange(item._id, "tags", arrayTags);
                    }}
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">RAG Description Context</label>
                  <textarea
                    value={item.description}
                    rows={2}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl transition-all outline-none text-xs text-slate-600 resize-none"
                    onChange={(e) => handleInputChange(item._id, "description", e.target.value)}
                  />
                </div>

                {/* Image Link (FIXED: Ab yeh input text fully editable hai) */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Image Link (URL)</label>
                  <input
                    type="text"
                    value={item.image}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 p-2.5 rounded-xl text-xs text-slate-600 font-mono outline-none"
                    onChange={(e) => handleInputChange(item._id, "image", e.target.value)}
                  />
                </div>

                {/* Interactive Save Button */}
                <button
                  onClick={() => handleUpdate(item._id, item)}
                  disabled={loadingId === item._id}
                  className={`w-full mt-auto py-3 px-4 rounded-xl font-bold tracking-wide shadow-sm transition-all ${
                    successId === item._id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-900 text-white hover:bg-red-500"
                  } disabled:opacity-50`}
                >
                  {loadingId === item._id ? "Saving to Cloud..." : successId === item._id ? "✓ Schema Synced" : "Save Changes"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
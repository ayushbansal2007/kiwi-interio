import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import QueriesList from "./QueriesList"; // Hamara banaya hua luxury query loader

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
  // 🟢 1. LocalStorage se raw data uthaya
  const storedRole = localStorage.getItem("role")?.toLowerCase(); 
  const userEmail = localStorage.getItem("email")?.toLowerCase() || "";

  // 🎯 2. FRONTEND IF-ELSE ROLE BYPASS LOGIC
  // Agar database me role user bhi ho, toh bhi ye emails check karke system role overwrite kar dega
  let finalRole = storedRole;

  if (userEmail === "hr@kiwiinterio.com") {
    finalRole = "hr";
  } else if (userEmail === "admin@kiwiinterio.com") {
    finalRole = "admin";
  } else if (userEmail === "manager@kiwiinterio.com") {
    finalRole = "manager";
  }

  // Global Access Layer validation based on bypassed role
  const hasAccess = finalRole === "admin" || finalRole === "hr" || finalRole === "manager";

  // Guard: Agar teeno me se koi match nahi hua, toh seedha home page par out!
  if (!hasAccess) {
    return <Navigate to="/" />;
  }

  useDocumentTitle(
    finalRole === "admin" 
      ? "God Mode | Control Panel" 
      : finalRole === "hr" 
      ? "HR Matrix | Client Queries" 
      : "Manager Panel | Kiwi Interio"
  );

  const [interiors, setInteriors] = useState<Interior[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // 🎯 3. CHOOSE FIRST LOADING PAGE
  // Agar HR login karega toh pehle "queries" load hoga, Admin/Manager ke liye "catalog"
  const [currentView, setCurrentView] = useState<"catalog" | "queries">(
    finalRole === "hr" ? "queries" : "catalog"
  );

  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Living Room", "Kitchen", "Bedroom", "Bathroom", "Office", "Dining Room"
  ]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  useEffect(() => {
    // Only fetch interior catalog if user is Admin or Manager (HR gets query blocks)
    if (finalRole === "admin" || finalRole === "manager") {
      fetch(`${API_BASE_URL}/api/interiors`)
        .then((res) => res.json())
        .then((data: Interior[]) => {
          setInteriors(data);
          const dbCategories = data.map(item => item.category).filter(Boolean);
          setAvailableCategories(prev => Array.from(new Set([...prev, ...dbCategories])));
        })
        .catch((err) => console.error("Error fetching interiors:", err));
    }
  }, [finalRole]);

  const handleInputChange = (id: string, field: keyof Interior, value: any) => {
    setInteriors((prevInteriors) =>
      prevInteriors.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
  };

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

  const handleUpdate = async (id: string, updatedItem: Interior) => {
    const token = localStorage.getItem("token");
    setLoadingId(id);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interior/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
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
    <div className="min-h-screen bg-white text-black py-16 px-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* EDITORIAL TOP HEADER LAYER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-8 mb-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-red-600 mb-2">
              Kiwi Interio Enterprise Architecture
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              {currentView === "catalog" ? "Catalog Workspace" : "Query Operations"}
            </h1>
          </div>
          
          {/* Real-time Dynamic Identity Badge */}
          <div className="mt-6 md:mt-0 bg-black text-white px-6 py-4 border border-black flex flex-col items-start md:items-end">
            <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
              Authenticated Session
            </span>
            <span className="text-sm font-black uppercase tracking-tight mt-1">
              {finalRole} Account
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5">
              {userEmail}
            </span>
          </div>
        </header>

        {/* 🛠— NAVIGATION TAB BAR - ONLY ADMIN CAN SWITCH VISUALLY */}
        {finalRole === "admin" && (
          <div className="flex gap-4 mb-12 border-b border-stone-100 pb-6">
            <button
              onClick={() => setCurrentView("catalog")}
              className={`text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 border transition-all ${
                currentView === "catalog"
                  ? "bg-black text-white border-black"
                  : "bg-white text-stone-400 border-stone-200 hover:text-black hover:border-black"
              }`}
            >
              Interior Catalog
            </button>
            <button
              onClick={() => setCurrentView("queries")}
              className={`text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 border transition-all ${
                currentView === "queries"
                  ? "bg-black text-white border-black"
                  : "bg-white text-stone-400 border-stone-200 hover:text-black hover:border-black"
              }`}
            >
              Customer Queries
            </button>
          </div>
        )}

        {/* 🔀 ACCESS ROUTER LOGIC RENDERING */}
        {currentView === "queries" ? (
          <QueriesList />
        ) : (
          /* =============================================================
             💎 ADMIN & MANAGER VIEW: LUXURY INTERIOR CATALOG CONTROL
             ============================================================= */
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
            {interiors.map((item) => (
              <div key={item._id} className="border border-stone-200 bg-white flex flex-col justify-between group">
                
                {/* Product Frame */}
                <div className="relative overflow-hidden aspect-[16/10] bg-stone-100 border-b border-stone-200">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider">
                    {item.roomType || "No Type"}
                  </div>
                </div>

                {/* Form Input Group */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Title Field</label>
                      <input
                        type="text"
                        value={item.title}
                        className="w-full border-b border-stone-200 focus:border-red-600 py-1.5 transition-all outline-none text-sm font-bold text-black uppercase tracking-tight bg-transparent"
                        onChange={(e) => handleInputChange(item._id, "title", e.target.value)}
                      />
                    </div>

                    {/* Taxonomy Inputs */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Category</label>
                        <select
                          value={item.category || ""}
                          className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs outline-none h-[28px]"
                          onChange={(e) => {
                            if (e.target.value === "ADD_NEW") {
                              handleAddNewCategory(item._id);
                            } else {
                              handleInputChange(item._id, "category", e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>Select</option>
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="ADD_NEW" className="text-red-600 font-bold">+ New</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Subcat</label>
                        <input
                          type="text"
                          value={item.subcategory || ""}
                          className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs outline-none"
                          onChange={(e) => handleInputChange(item._id, "subcategory", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Style</label>
                        <input
                          type="text"
                          value={item.style || ""}
                          className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs outline-none"
                          onChange={(e) => handleInputChange(item._id, "style", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Room Context</label>
                        <input
                          type="text"
                          value={item.roomType || ""}
                          className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs outline-none"
                          onChange={(e) => handleInputChange(item._id, "roomType", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs font-bold text-black"
                          onChange={(e) => handleInputChange(item._id, "price", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Search Tags */}
                    <div>
                      <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">Search Tags</label>
                      <input
                        type="text"
                        value={item.tags ? item.tags.join(", ") : ""}
                        className="w-full border-b border-stone-200 focus:border-red-600 py-1 bg-transparent text-xs font-mono outline-none text-stone-600"
                        onChange={(e) => {
                          const arrayTags = e.target.value.split(",").map(tag => tag.trim());
                          handleInputChange(item._id, "tags", arrayTags);
                        }}
                      />
                    </div>

                    {/* RAG Description */}
                    <div>
                      <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1 tracking-wider">RAG Context Description</label>
                      <textarea
                        value={item.description}
                        rows={2}
                        className="w-full border border-stone-200 focus:border-black p-2 mt-1 text-xs text-stone-600 resize-none outline-none"
                        onChange={(e) => handleInputChange(item._id, "description", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Save Action Button */}
                  <button
                    onClick={() => handleUpdate(item._id, item)}
                    disabled={loadingId === item._id}
                    className={`w-full mt-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      successId === item._id
                        ? "bg-emerald-600 text-white"
                        : "bg-black text-white hover:bg-red-600"
                    } disabled:opacity-40`}
                  >
                    {loadingId === item._id ? "Syncing Schema..." : successId === item._id ? "✓ Data Synchronized" : "Save Changes"}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
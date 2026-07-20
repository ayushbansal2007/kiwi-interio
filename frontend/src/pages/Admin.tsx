import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import QueriesList from "./QueriesList"; 
import useAuth from "../hooks/useAuth";
import { apiClient } from "../services/apiClient";

interface Interior {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  subcategory: string;
  style: string;
  tags: string[]; // Strict RAG Matrix Array format
  roomType: string;
  price: number;
}

function Admin() {
 const { user, accessToken } = useAuth();

const finalRole = user?.role?.toLowerCase() || "";
const userEmail = user?.email?.toLowerCase() || "";

const hasAccess =
  finalRole === "admin" ||
  finalRole === "hr" ||
  finalRole === "manager";

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

const [currentView, setCurrentView] = useState<"catalog" | "queries">(
  finalRole === "hr" ? "queries" : "catalog"
);

const [selectedCategory, setSelectedCategory] = useState<string>("All");

const [availableCategories, setAvailableCategories] = useState<string[]>([
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Office",
  "Dining Room",
]);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://kiwi-interio.onrender.com";

useEffect(() => {
  if (finalRole === "admin" || finalRole === "manager") {
    apiClient(`${API_BASE_URL}/api/interiors`)
      .then((res) => res.json())
      .then((data: Interior[]) => {
        const normalizedData = data.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags)
            ? item.tags
            : typeof item.tags === "string"
            ? item.tags.split(",")
            : [],
        }));

        setInteriors(normalizedData);

        const dbCategories = normalizedData
          .map((item) => item.category)
          .filter(Boolean);

        setAvailableCategories((prev) =>
          Array.from(new Set([...prev, ...dbCategories]))
        );
      })
      .catch((err) => console.error("Error fetching interiors:", err));
  }
}, [finalRole, API_BASE_URL]);

const handleInputChange = (
  id: string,
  field: keyof Interior,
  value: any
) => {
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
      setAvailableCategories((prev) => [...prev, cleanCat]);
    }

    handleInputChange(id, "category", cleanCat);
  }
};

const handleUpdate = async (
  id: string,
  updatedItem: Interior
) => {
  setLoadingId(id);

  const sanitizedTags = Array.isArray(updatedItem.tags)
    ? updatedItem.tags
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== "")
    : [];

  const finalPayload = {
    ...updatedItem,
    tags: sanitizedTags,
  };

  try {
    const response = await apiClient(
      `${API_BASE_URL}/api/interiors/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken
            ? `Bearer ${accessToken}`
            : "",
        },
        body: JSON.stringify(finalPayload),
      }
    );

    if (response.ok) {
      setSuccessId(id);

      setInteriors((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, tags: sanitizedTags }
            : item
        )
      );

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

const filteredInteriors =
  selectedCategory === "All"
    ? interiors
    : interiors.filter(
        (item) =>
          item.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* EDITORIAL TOP HEADER LAYER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-300 pb-8 mb-10 gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-600 mb-2">
              Kiwi Interio Enterprise Architecture
            </p>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-neutral-950">
              {currentView === "catalog" ? "Catalog Workspace" : "Query Operations"}
            </h1>
          </div>
          
          {/* Identity Badge */}
          <div className="bg-neutral-950 text-white px-5 py-3.5 rounded-sm shadow-sm flex flex-col items-start md:items-end min-w-[240px]">
            <span className="text-[9px] font-bold tracking-[0.2em] text-red-400 uppercase">
              Authenticated Session
            </span>
            <span className="text-sm font-bold uppercase tracking-tight mt-1">
              {finalRole} Account
            </span>
            <span className="text-[10px] text-neutral-400 font-mono mt-0.5 break-all w-full md:text-right">
              {userEmail}
            </span>
          </div>
        </header>

        {/* NAVIGATION TAB BAR */}
        {finalRole === "admin" && (
          <div className="flex gap-3 mb-6 border-b border-neutral-200 pb-5 overflow-x-auto scaffolding-scroll">
            <button
              onClick={() => setCurrentView("catalog")}
              className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-md transition-all whitespace-nowrap ${
                currentView === "catalog"
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-white text-neutral-500 border border-neutral-200 hover:text-neutral-900 hover:border-neutral-400"
              }`}
            >
              Interior Catalog
            </button>
            <button
              onClick={() => setCurrentView("queries")}
              className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-md transition-all whitespace-nowrap ${
                currentView === "queries"
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-white text-neutral-500 border border-neutral-200 hover:text-neutral-900 hover:border-neutral-400"
              }`}
            >
              Customer Queries
            </button>
          </div>
        )}

        {/* ACCESS ROUTER RENDERING */}
        {currentView === "queries" ? (
          <QueriesList />
        ) : (
          <>
            {/* DYNAMIC CATEGORY FILTER PILLS */}
            <div className="mb-8 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Quick Category Filter ({filteredInteriors.length} items found)
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === "All"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  All Workspace
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State Handler */}
            {filteredInteriors.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-xl">
                <p className="text-sm text-neutral-500 font-medium">Is category me abhi koi data nahi mila.</p>
              </div>
            )}

            {/* CATALOG CONTROL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInteriors.map((item) => (
                <div key={item._id} className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
                  
                  {/* Image Showcase Frame */}
                  <div className="relative overflow-hidden aspect-[16/10] bg-neutral-100 border-b border-neutral-100">
                    <img 
                      src={item.image || "https://placehold.co/600x400?text=No+Image+Provided"} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-neutral-950/90 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.roomType || "General"}
                    </div>
                  </div>

                  {/* Content Configuration Form */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      
                      {/* Title Input */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Design Title</label>
                        <input
                          type="text"
                          value={item.title}
                          className="w-full border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded px-3 py-1.5 transition-all outline-none text-sm font-semibold text-neutral-900"
                          onChange={(e) => handleInputChange(item._id, "title", e.target.value)}
                        />
                      </div>

                      {/* Image Resource Link */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Image Resource Link</label>
                        <input
                          type="text"
                          value={item.image}
                          placeholder="https://example.com/image.jpg"
                          className="w-full border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded px-3 py-1.5 transition-all outline-none text-xs font-mono text-neutral-600 bg-neutral-50/50"
                          onChange={(e) => handleInputChange(item._id, "image", e.target.value)}
                        />
                      </div>

                      {/* Taxonomy Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Category</label>
                          <select
                            value={item.category || ""}
                            className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-2 py-1.5 text-xs outline-none bg-white h-[34px]"
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
                            <option value="ADD_NEW" className="text-red-600 font-bold">+ Create New</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Subcat</label>
                          <input
                            type="text"
                            value={item.subcategory || ""}
                            className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-2 py-1.5 text-xs outline-none h-[34px]"
                            onChange={(e) => handleInputChange(item._id, "subcategory", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Style</label>
                          <input
                            type="text"
                            value={item.style || ""}
                            className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-2 py-1.5 text-xs outline-none h-[34px]"
                            onChange={(e) => handleInputChange(item._id, "style", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Metadata Specs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Room Context</label>
                          <input
                            type="text"
                            value={item.roomType || ""}
                            className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-3 py-1.5 text-xs outline-none"
                            onChange={(e) => handleInputChange(item._id, "roomType", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">Price (₹)</label>
                          <input
                            type="number"
                            value={item.price}
                            className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-3 py-1.5 text-xs font-bold text-neutral-900"
                            onChange={(e) => handleInputChange(item._id, "price", Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* 🟢 FIXED: SEARCH TAGS WITH ROBUST SAFE IN-LINE STATE HANDLING */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">
                          Tags (Comma Separated)
                        </label>
                        <input
                          type="text"
                          // Fallback arrays completely logic fix
                          value={Array.isArray(item.tags) ? item.tags.join(", ") : ""}
                          placeholder="modern, minimal, office"
                          className="w-full border border-neutral-200 focus:border-neutral-900 rounded px-3 py-1.5 text-xs font-mono text-neutral-800 bg-red-50/20"
                          onChange={(e) => {
                            // Split on comma instantly map values
                            const stringVal = e.target.value;
                            const arrayTags = stringVal.split(",").map(tag => tag.trim());
                            // Temporary tracking framework update
                            handleInputChange(item._id, "tags", arrayTags);
                          }}
                        />
                      </div>

                      {/* Description Textarea */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1 tracking-wider">RAG Prompt Context Description</label>
                        <textarea
                          value={item.description}
                          rows={3}
                          className="w-full border border-neutral-200 focus:border-neutral-900 rounded p-2.5 text-xs text-neutral-600 resize-none outline-none bg-neutral-50/30"
                          onChange={(e) => handleInputChange(item._id, "description", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Operational Sync Action */}
                    <button
                      onClick={() => handleUpdate(item._id, item)}
                      disabled={loadingId === item._id}
                      className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        successId === item._id
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-neutral-950 text-white hover:bg-neutral-800 shadow-sm"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {loadingId === item._id ? "Syncing Schema..." : successId === item._id ? "✓ Data Synchronized" : "Save Changes"}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
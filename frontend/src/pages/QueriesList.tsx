import { useEffect, useState } from "react";
// 📊 CHART.JS IMPORTS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { apiClient } from "../services/apiClient";

// Register ChartJS modules safely
ChartJS.register(ArcElement, Tooltip, Legend);

interface QueryItem {
  _id: string;
  id?: string;
  ticketId?: string; 
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "Pending" | "In-Progress" | "Resolved";
  createdAt: string;
}

function QueriesList() {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiClient(`${API_BASE_URL}/api/queries/all`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setQueries(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching queries:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    const nextStatus = currentStatus === "Pending" ? "In-Progress" : "Resolved";

    try {
      const res = await apiClient(`${API_BASE_URL}/api/queries/update-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      
      const data = await res.json();

      if (data.success) {
        if (data.action === "deleted" || nextStatus === "Resolved") {
          setQueries((prev) => prev.filter((q) => q._id !== id && q.id !== id));
        } else {
          setQueries((prev) =>
            prev.map((q) => {
              const currentId = q._id || q.id;
              return currentId === id ? { ...q, status: nextStatus } : q;
            })
          );
        }
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // 🎯 REAL-TIME DATA PARSING FOR CHART
  const pendingCount = queries.filter((q) => q.status === "Pending").length;
  const inProgressCount = queries.filter((q) => q.status === "In-Progress").length;

  const chartData = {
    labels: ["Pending Inquiries", "In-Progress Leads"],
    datasets: [
      {
        data: [pendingCount, inProgressCount],
        backgroundColor: ["#dc2626", "#d97706"], // Red-600 for Pending, Amber-600 for In-Progress
        borderColor: ["#000000", "#000000"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
            family: "monospace",
            weight: "bold" as const,
          },
          color: "#000000",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-bold uppercase tracking-[0.4em] text-stone-300 animate-pulse">
        Syncing Secure Communication Logs...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 📊 ANALYTICS MATRIX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border border-black divide-y lg:divide-y-0 lg:divide-x divide-black">
        <div className="p-8 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Unresolved Tickets</p>
          <p className="text-5xl font-black text-red-600">
            {queries.filter((q) => q.status !== "Resolved").length}
          </p>
        </div>
        
        <div className="p-8 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Total Communications</p>
          <p className="text-5xl font-black text-black">{queries.length}</p>
        </div>

        {/* 📉 LIVE DOUGHNUT CHART GRAPHIC */}
        <div className="p-6 flex flex-col items-center justify-center bg-stone-50 h-[180px]">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 self-start">Pipeline Distribution</p>
          {queries.length === 0 ? (
            <p className="text-[10px] text-stone-400 italic">No Active Leads to Plot</p>
          ) : (
            <div className="w-full h-full max-h-[120px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* 📁 COMMUNICATION LOGS CARDS */}
      <div className="space-y-0">
        {queries.length === 0 ? (
          <p className="text-stone-400 text-sm italic py-10 uppercase tracking-wider">No client messages logs stored in cloud database.</p>
        ) : (
          queries.map((query) => {
            const currentUniqueId = query._id || query.id || "";
            return (
              <div
                key={currentUniqueId}
                className="group border-b border-stone-200 py-10 flex flex-col lg:flex-row justify-between items-start gap-8 hover:bg-stone-50 transition-colors px-4"
              >
                <div className="lg:w-1/4 space-y-1">
                  <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-200 block w-max mb-1">
                    {query.ticketId || "LEGACY-LOG"}
                  </span>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Inquiry From</p>
                  <p className="text-xl font-black uppercase tracking-tight text-black">{query.name}</p>
                  <p className="text-xs font-mono text-stone-400">{query.email}</p>
                  <p className="text-xs font-mono text-stone-700 font-semibold">{query.phone}</p>
                  <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
                    Received: {new Date(query.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="lg:w-2/4 space-y-3">
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest">Message Text Context</p>
                  <p className="text-stone-600 font-light leading-relaxed text-sm">
                    "{query.message}"
                  </p>
                  <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
                    Stamp: {new Date(query.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="lg:w-1/4 flex flex-col items-end gap-4 w-full lg:w-auto">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border ${
                    query.status === "Pending" ? "bg-red-50 text-red-600 border-red-200" : query.status === "In-Progress" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-stone-900 text-white border-black"
                  }`}>
                    ● {query.status}
                  </span>

                  {query.status !== "Resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(currentUniqueId, query.status)}
                      className="bg-black hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 transition-colors duration-300"
                    >
                      {query.status === "Pending" ? "Mark Processing →" : "Mark Resolved ✓"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default QueriesList;

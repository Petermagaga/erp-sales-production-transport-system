import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react"; // 🧩 optional icons

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/sales/feedbacks/");
        setCampaigns(res.data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to fetch marketing feedback.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-green-700 animate-pulse">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Loading feedback campaigns...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-600 font-medium">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          🗣 Marketing Feedback
        </h2>
        <p className="text-gray-600 text-sm">
          Insights and feedback received from recent marketing campaigns.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center text-lg py-10">
          No campaigns available.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-100">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="py-3 px-4 font-semibold rounded-tl-2xl">#</th>
                <th className="py-3 px-4 font-semibold">Campaign Name</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold rounded-tr-2xl">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-green-50 border-b border-gray-100 transition-all"
                >
                  <td className="py-3 px-4 text-center font-medium text-green-700">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">{item.name || "N/A"}</td>
                  <td className="py-3 px-4">{item.message || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(item.date).toLocaleDateString() || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Campaigns;

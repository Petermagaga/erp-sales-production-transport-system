import { useEffect, useState, useContext } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Edit3, PlusCircle } from "lucide-react";

const SalesList = () => {
  const {authTokens} = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await API.get("sales/sales/", {
          headers: { Authorization: `Bearer ${authTokens?.access}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.results;
        setSales(data || []);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);


  return (
    <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-emerald-600" />
          Sales Records
        </h2>

        <Link
          to="/sales/add"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Add Sale
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Customer</th>
              <th className="py-3 px-4 text-left font-semibold">Product</th>
              <th className="py-3 px-4 text-left font-semibold">Amount</th>
              <th className="py-3 px-4 text-left font-semibold">Date</th>
              <th className="py-3 px-4 text-left font-semibold text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  Loading sales records...
                </td>
              </tr>
            ) : sales.length > 0 ? (
              sales.map((s, index) => (
                <tr
                  key={s.id}
                  className={`hover:bg-emerald-50 transition duration-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 border-b">{s.customer?.name}</td>
                  <td className="py-3 px-4 border-b">{s.product?.name}</td>
                  <td className="py-3 px-4 border-b font-semibold text-emerald-700">
                    ${s.total_amount}
                  </td>
                  <td className="py-3 px-4 border-b">{s.date}</td>
                  <td className="py-3 px-4 border-b text-center">
                    <div className="flex justify-center gap-4">
                      <Link
                        to={`/sales/view/${s.id}`}
                        className="text-emerald-600 hover:scale-110 transition-transform"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/sales/edit/${s.id}`}
                        className="text-yellow-600 hover:scale-110 transition-transform"
                        title="Edit"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesList;

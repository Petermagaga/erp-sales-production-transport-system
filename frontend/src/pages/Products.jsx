// src/pages/Products.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/sales/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2"
      >
        <PackageSearch className="text-amber-500" size={26} />
        <h2 className="text-2xl font-bold text-emerald-900">
          Product Inventory
        </h2>
      </motion.div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-emerald-100 rounded-xl shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No products found.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-emerald-900 text-amber-100">
              <tr>
                <th className="p-3 text-left font-semibold">Name</th>
                <th className="p-3 text-left font-semibold">Category</th>
                <th className="p-3 text-left font-semibold">Price (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, index) => (
                <tr
                  key={prod.id}
                  className={`transition-all ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-amber-50`}
                >
                  <td className="p-3 border-t border-gray-200 text-gray-800">
                    {prod.name}
                  </td>
                  <td className="p-3 border-t border-gray-200 text-gray-700">
                    {prod.category}
                  </td>
                  <td className="p-3 border-t border-gray-200 text-emerald-800 font-semibold">
                    {Number(prod.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default Products;

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // for loading spinner

const AddSale = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salesperson_id: "",
    customer_id: "",
    product_id: "",
    quantity: "",
    unit_price: "",
    location: "",
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, productsRes, salesRes] = await Promise.all([
          axios.get("/api/sales/customers/"),
          axios.get("/api/sales/products/"),
          axios.get("/api/sales/salespersons/"),
        ]);

        const normalize = (data) =>
          Array.isArray(data) ? data : data.results || [];

        setCustomers(normalize(customersRes.data));
        setProducts(normalize(productsRes.data));
        setSalespersons(normalize(salesRes.data));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find((p) => p.id == selectedId);

    setFormData({
      ...formData,
      product_id: selectedId,
      unit_price: selectedProduct ? selectedProduct.unit_price : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity),
      unit_price: parseFloat(formData.unit_price),
      total_amount:
        parseFloat(formData.quantity) * parseFloat(formData.unit_price),
    };

    try {
      setLoading(true);
      await axios.post("/api/sales/", payload);
      navigate("/sales");
    } catch (err) {
      console.error("Error saving sale:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 border border-gray-100 transition-all hover:shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          🧾 Add New Sale
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Fill in the details below to record a new sales transaction.
        </p>

        {/* Salesperson */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Salesperson
          </label>
          <select
            value={formData.salesperson_id}
            onChange={(e) =>
              setFormData({ ...formData, salesperson_id: e.target.value })
            }
            className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            required
          >
            <option value="">Select Salesperson</option>
            {salespersons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Customer */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Customer</label>
          <select
            value={formData.customer_id}
            onChange={(e) =>
              setFormData({ ...formData, customer_id: e.target.value })
            }
            className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shop_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Product</label>
          <select
            value={formData.product_id}
            onChange={handleProductChange}
            className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            required
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            required
          />
        </div>

        {/* Unit Price */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Unit Price (KES)
          </label>
          <input
            type="number"
            value={formData.unit_price}
            onChange={(e) =>
              setFormData({ ...formData, unit_price: e.target.value })
            }
            className={`border border-gray-300 p-2.5 w-full rounded-lg ${
              formData.product_id ? "bg-white" : "bg-gray-100"
            } focus:ring-2 focus:ring-green-600 outline-none`}
            readOnly={!formData.product_id}
            required
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-all flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" /> Saving...
            </>
          ) : (
            "💾 Save Sale"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddSale;

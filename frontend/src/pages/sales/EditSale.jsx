// src/pages/sales/EditSale.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditSale = () => {
  const {authTokens} = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    quantity: "",
    total_price: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/sales/${id}/`)
      .then(res => {
        setFormData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/sales/${id}/`, formData)
      .then(() => {
        alert("Sale updated successfully!");
        navigate("/sales");
      })
      .catch(err => console.error(err));
  };

  if (loading) return <p>Loading sale data...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Edit Sale</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Customer</label>
          <input
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Product</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label>Total Price</label>
          <input
            type="number"
            name="total_price"
            value={formData.total_price}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Sale
        </button>
      </form>
    </div>
  );
};

export default EditSale;

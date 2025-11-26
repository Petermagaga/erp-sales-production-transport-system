// src/pages/sales/ViewSale.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ViewSale = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    axios.get(`/sales/${id}/`, {
  headers: { Authorization: `Bearer ${authTokens?.access}` }
})
      .then(res => setSale(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!sale) return <p>Loading sale details...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Sale Details</h2>
      <div className="space-y-2">
        <p><strong>Customer:</strong> {sale.customer}</p>
        <p><strong>Product:</strong> {sale.product}</p>
        <p><strong>Quantity:</strong> {sale.quantity}</p>
        <p><strong>Total Price:</strong> KES {sale.total_amount}</p>
        <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
      </div>
      <div className="mt-4 flex space-x-3">
        <Link to={`/sales/edit/${sale.id}`} className="bg-yellow-500 text-white px-3 py-2 rounded">
          Edit
        </Link>
        <Link to="/sales" className="bg-gray-500 text-white px-3 py-2 rounded">
          Back to Sales
        </Link>
      </div>
    </div>
  );
};

export default ViewSale;

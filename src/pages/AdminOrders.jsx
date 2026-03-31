import BASE_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("${BASE_URL}/api/orders/all");

      // ✅ Hide Delivered orders — they go to Order History page
      const active = res.data.filter(o => o.status !== "Delivered");
      setOrders(active);

      let totalRevenue = 0;
      let totalProducts = 0;
      res.data.forEach(order => {
        totalRevenue += order.totalAmount;
        order.products.forEach(p => { totalProducts += p.qty; });
      });

      setStats({ totalOrders: res.data.length, totalRevenue, totalProducts });
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/orders/update/${id}`, { status });
      fetchOrders();
      window.dispatchEvent(new Event("orderUpdated"));
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":   return "text-yellow-600";
      case "Accepted":  return "text-blue-600";
      case "Shipped":   return "text-purple-600";
      case "Delivered": return "text-green-600";
      case "Cancelled": return "text-red-600";
      default: return "";
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Orders</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-500 text-white p-4 rounded shadow">
          <h2 className="text-base sm:text-lg">Total Orders</h2>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <h2 className="text-base sm:text-lg">Total Revenue</h2>
          <p className="text-2xl font-bold">₹ {stats.totalRevenue}</p>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded shadow">
          <h2 className="text-base sm:text-lg">Products Sold</h2>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>
      </div>

      {/* ORDER LIST */}
      {orders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded shadow text-center text-gray-400 text-base sm:text-lg">
          No active orders
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-4 sm:p-5 rounded shadow">

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.phone}</p>
                  <p className="text-sm text-gray-500">{order.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-row sm:flex-col sm:text-right items-center sm:items-end gap-3 sm:gap-0">
                  <p className={`font-semibold sm:mb-2 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border p-2 rounded text-sm"
                  >
                    <option>Pending</option>
                    <option>Accepted</option>
                    <option>Shipped</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS */}
              <div className="mt-4 border-t pt-3">
                {order.products.map((p, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{p.name} x {p.qty}</span>
                    <span>₹ {p.price * p.qty}</span>
                  </div>
                ))}
              </div>

              <div className="text-right font-bold mt-3">
                Total: ₹ {order.totalAmount}
              </div>

              {order.status === "Accepted" && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                  🔐 OTP sent to customer email. Go to <strong>Delivery Page</strong> to verify OTP and confirm delivery.
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
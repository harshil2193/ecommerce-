import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {

  const [allOrders, setAllOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("All");

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalCancelled: 0,
    totalDelivered: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all");
      setAllOrders(res.data);

      let totalRevenue = 0;
      let totalProducts = 0;
      let totalPending = 0;
      let totalAccepted = 0;
      let totalCancelled = 0;
      let totalDelivered = 0;

      res.data.forEach(order => {
        totalRevenue += order.totalAmount;
        order.products.forEach(p => { totalProducts += p.qty; });
        if (order.status === "Pending")   totalPending++;
        if (order.status === "Accepted")  totalAccepted++;
        if (order.status === "Cancelled") totalCancelled++;
        if (order.status === "Delivered") totalDelivered++;
      });

      setStats({
        totalOrders: res.data.length,
        totalRevenue,
        totalProducts,
        totalPending,
        totalAccepted,
        totalCancelled,
        totalDelivered,
      });

    } catch (err) {
      console.log(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setTotalItems(res.data.length);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/update/${id}`, { status });
      fetchOrders();
      window.dispatchEvent(new Event("orderUpdated"));
    } catch (err) {
      console.log(err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
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

  // ✅ Filter orders — always hide Delivered (they go to Order History)
  const filteredOrders = allOrders.filter(order => {
    if (order.status === "Delivered") return false;
    if (filter === "All") return true;
    return order.status === filter;
  });

  const filterButtons = [
    { label: "All",       color: "bg-gray-600",   count: allOrders.filter(o => o.status !== "Delivered").length },
    { label: "Pending",   color: "bg-yellow-500", count: stats.totalPending },
    { label: "Accepted",  color: "bg-blue-500",   count: stats.totalAccepted },
    { label: "Cancelled", color: "bg-red-500",    count: stats.totalCancelled },
  ];

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">

        <div className="bg-purple-800 text-white p-4 sm:p-5 rounded-lg shadow text-center">
          <h2 className="text-xs sm:text-sm">Total Products</h2>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{totalItems}</p>
        </div>

        <div className="bg-yellow-500 text-white p-4 sm:p-5 rounded-lg shadow text-center">
          <h2 className="text-xs sm:text-sm">Pending Orders</h2>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalPending}</p>
        </div>

        <div className="bg-blue-500 text-white p-4 sm:p-5 rounded-lg shadow text-center">
          <h2 className="text-xs sm:text-sm">Total Orders</h2>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalOrders}</p>
        </div>

        <div className="bg-green-500 text-white p-4 sm:p-5 rounded-lg shadow text-center">
          <h2 className="text-xs sm:text-sm">Total Revenue</h2>
          <p className="text-xl sm:text-3xl font-bold mt-1">₹ {stats.totalRevenue}</p>
        </div>

      </div>

      {/* ===== FILTER BUTTONS ===== */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filterButtons.map(btn => (
          <button
            key={btn.label}
            onClick={() => setFilter(btn.label)}
            className={`px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2 transition-all
              ${filter === btn.label ? btn.color + " ring-4 ring-offset-1 ring-gray-400 scale-105" : "bg-gray-400 hover:scale-105"}`}
          >
            {btn.label}
            <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* ===== ORDER LIST ===== */}
      <h2 className="text-xl font-semibold mb-4">
        {filter === "All" ? "All Active Orders" : `${filter} Orders`}
        <span className="ml-2 text-sm font-normal text-gray-500">({filteredOrders.length})</span>
      </h2>

      {filteredOrders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded shadow text-center text-gray-400 text-base sm:text-lg">
          No {filter === "All" ? "active" : filter.toLowerCase()} orders
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
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
                {order.products.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
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
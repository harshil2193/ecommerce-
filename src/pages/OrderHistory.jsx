import BASE_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderHistory() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  // ✅ Only show Delivered orders
  const fetchDeliveredOrders = async () => {
    try {
      const res = await axios.get("${BASE_URL}/api/orders/all");
      const delivered = res.data.filter(o => o.status === "Delivered");
      setOrders(delivered);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">

      <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">📦 Order History</h1>
      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">All successfully delivered orders.</p>

      {orders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded shadow text-center text-gray-400 text-base sm:text-lg">
          No delivered orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-4 sm:p-5 rounded shadow border-l-4 border-green-500">

              {/* CUSTOMER INFO */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <p className="font-semibold text-base sm:text-lg">{order.customerName}</p>
                  <p className="text-sm text-gray-500">📞 {order.phone}</p>
                  <p className="text-sm text-gray-500">📍 {order.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ordered: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold self-start">
                  ✅ Delivered
                </span>
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

              <div className="text-right font-bold mt-2 text-green-700">
                Total: ₹ {order.totalAmount}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
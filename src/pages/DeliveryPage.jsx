import BASE_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DeliveryPage() {

  const [orders, setOrders] = useState([]);
  const [otpMap, setOtpMap] = useState({});

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  // ✅ Only fetch Accepted orders
  const fetchAcceptedOrders = async () => {
    try {
      const res = await axios.get("${BASE_URL}/api/orders/all");
      const accepted = res.data.filter(o => o.status === "Accepted");
      setOrders(accepted);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOtpChange = (orderId, value) => {
    setOtpMap(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], otp: value, error: "", success: "" }
    }));
  };

  const verifyOtp = async (orderId) => {
    const otpValue = otpMap[orderId]?.otp || "";

    if (!otpValue || otpValue.length !== 6) {
      setOtpMap(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], error: "Please enter a valid 6-digit OTP" }
      }));
      return;
    }

    setOtpMap(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: true, error: "" } }));

    try {
      const res = await axios.post(
        `${BASE_URL}/api/orders/verify-otp/${orderId}`,
        { otp: otpValue }
      );

      setOtpMap(prev => ({
        ...prev,
        [orderId]: { otp: "", loading: false, error: "", success: res.data.message }
      }));

      // ✅ Remove from list after short delay
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o._id !== orderId));
        window.dispatchEvent(new Event("orderUpdated"));
      }, 1500);

    } catch (err) {
      setOtpMap(prev => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          loading: false,
          error: err.response?.data?.message || "Invalid OTP"
        }
      }));
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">

      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">🚚 Delivery Page</h1>
      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Shows only Accepted orders. Enter OTP from customer to confirm delivery.</p>

      {orders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded shadow text-center text-gray-400 text-base sm:text-lg">
          No pending deliveries
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-4 sm:p-5 rounded shadow">

              {/* CUSTOMER INFO */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <p className="font-semibold text-base sm:text-lg">{order.customerName}</p>
                  <p className="text-sm text-gray-500">📞 {order.phone}</p>
                  <p className="text-sm text-gray-500">📍 {order.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold self-start">
                  Accepted
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

              <div className="text-right font-bold mt-2">
                Total: ₹ {order.totalAmount}
              </div>

              {/* OTP INPUT */}
              <div className="mt-4 border-t pt-4 bg-yellow-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  🔐 Enter OTP provided by customer to confirm delivery
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otpMap[order._id]?.otp || ""}
                    onChange={(e) => handleOtpChange(order._id, e.target.value)}
                    className="border-2 p-2 rounded w-full sm:w-40 text-center tracking-widest text-xl font-bold focus:border-green-500 outline-none"
                  />
                  <button
                    onClick={() => verifyOtp(order._id)}
                    disabled={otpMap[order._id]?.loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-semibold w-full sm:w-auto"
                  >
                    {otpMap[order._id]?.loading ? "Verifying..." : "✅ Verify & Deliver"}
                  </button>
                </div>

                {otpMap[order._id]?.error && (
                  <p className="text-red-500 text-sm mt-2">❌ {otpMap[order._id].error}</p>
                )}
                {otpMap[order._id]?.success && (
                  <p className="text-green-600 font-semibold text-sm mt-2">✅ {otpMap[order._id].success}</p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
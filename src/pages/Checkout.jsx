import BASE_URL from '../config.js'
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {

  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("COD");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;
      const res = await axios.post(`${BASE_URL}/api/cart/get`, { userId: user._id });
      setCart(res.data.products || []);
    };
    loadCart();
    loadRazorpayScript();
  }, []);

  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);
  const delivery = total > 10 ? 0 : 50;
  const discount = 0;
  const finalTotal = total + delivery - discount;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim())    newErrors.name    = "Full name is required";
    if (!form.phone.trim())   newErrors.phone   = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim())    newErrors.city    = "City is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim())) newErrors.pincode = "Enter a valid 6-digit pincode";
    return newErrors;
  };

  const createOrderInDB = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await axios.post(`${BASE_URL}/api/orders/create`, {
      userId: user._id,
      customerName: form.name,
      phone: form.phone,
      address: `${form.address}, ${form.city}, ${form.pincode}`,
      paymentMethod: payment === "COD" ? "COD" : "ONLINE",
      products: cart,
      totalAmount: finalTotal
    });
    return res.data.order;
  };

  const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    await axios.post(`${BASE_URL}/api/cart`, {
      userId: user._id,
      products: []
    });
  };

  const handleOnlinePayment = async (order) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load payment gateway. Please check your internet connection.");
      setLoading(false);
      return;
    }

    const { data } = await axios.post(`${BASE_URL}/api/payment/create-order`, {
      amount: finalTotal
    });

    const user = JSON.parse(localStorage.getItem("user"));

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "E-Commerce Store",
      description: `Order #${order._id}`,
      order_id: data.orderId,
      prefill: {
        name: form.name,
        contact: form.phone,
        email: user?.email || ""
      },
      theme: {
        color: "#4F46E5"
      },
      handler: async function (response) {
        try {
          const verifyRes = await axios.post(`${BASE_URL}/api/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id
          });

          if (verifyRes.data.success) {
            await clearCart();
            navigate("/order-success");
          } else {
            alert("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        } catch (err) {
          alert("Payment verification error: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      },
      modal: {
        ondismiss: async function () {
          try {
            await axios.delete(`${BASE_URL}/api/orders/delete/${order._id}`);
          } catch (e) {
            console.log("Cleanup error:", e);
          }
          setLoading(false);
          alert("Payment cancelled. Your order was not placed.");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const placeOrder = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (payment === "COD") {
        await createOrderInDB();
        await clearCart();
        navigate("/order-success");
      } else {
        const order = await createOrderInDB();
        await handleOnlinePayment(order);
      }
    } catch (err) {
      console.log(err);
      alert("Order failed: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

      <div className="md:col-span-2 space-y-4 sm:space-y-6">

        <div className="bg-white p-4 sm:p-5 rounded-lg shadow">
          <h2 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">📍 Delivery Address</h2>

          <div className="mb-3">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none ${errors.name ? "border-red-400" : ""}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-3">
            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none ${errors.phone ? "border-red-400" : ""}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-3">
            <textarea
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none ${errors.address ? "border-red-400" : ""}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                name="city"
                placeholder="City"
                onChange={handleChange}
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none ${errors.city ? "border-red-400" : ""}`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <input
                name="pincode"
                placeholder="Pincode"
                onChange={handleChange}
                className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none ${errors.pincode ? "border-red-400" : ""}`}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-lg shadow">
          <h2 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">💳 Payment Method</h2>

          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer mb-3 transition-all ${payment === "COD" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
            <input
              type="radio"
              checked={payment === "COD"}
              onChange={() => setPayment("COD")}
              className="accent-indigo-600"
            />
            <div>
              <p className="font-medium">💵 Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when your order arrives</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${payment === "Online" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
            <input
              type="radio"
              checked={payment === "Online"}
              onChange={() => setPayment("Online")}
              className="accent-indigo-600"
            />
            <div className="flex-1">
              <p className="font-medium">📲 Online Payment</p>
              <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets</p>
            </div>
            <div className="flex gap-1 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">UPI</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Cards</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Wallets</span>
            </div>
          </label>

          {payment === "Online" && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              🔒 Secured by <strong>Razorpay</strong> — 100% safe & encrypted payment
            </div>
          )}
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-lg shadow">
          <h2 className="font-semibold mb-3 text-base sm:text-lg">🚚 Delivery Info</h2>
          <p className="text-sm sm:text-base">Free delivery on orders above ₹500</p>
          <p className="text-sm sm:text-base">Estimated delivery: 3–5 days</p>
        </div>

      </div>

      {/* Order Summary - sticks to bottom on mobile, side on desktop */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow h-fit md:sticky md:top-20">

        <h2 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">🧾 Order Summary</h2>

        {cart.map(item => (
          <div key={item._id} className="flex justify-between text-sm mb-2">
            <span>{item.name} x {item.qty}</span>
            <span>₹ {item.price * item.qty}</span>
          </div>
        ))}

        <hr className="my-3" />

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹ {total}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>- ₹ {discount}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{delivery === 0 ? "Free" : `₹ ${delivery}`}</span>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-indigo-600">₹ {finalTotal}</span>
        </div>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Processing...
            </>
          ) : (
            payment === "Online" ? `💳 Pay ₹${finalTotal}` : "✅ Place Order"
          )}
        </button>

        {payment === "Online" && (
          <p className="text-center text-xs text-gray-400 mt-2">🔒 Secured by Razorpay</p>
        )}

      </div>

    </div>
  );
}
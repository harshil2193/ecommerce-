import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cart() {

  const [cart, setCart] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  const navigate = useNavigate();
  const TITLE_LIMIT = 60;

  // ✅ LOAD CART FROM BACKEND
  useEffect(() => {

    const fetchCart = async () => {

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        const res = await axios.post("http://localhost:5000/api/cart/get", {
          userId: user._id
        });

        setCart(res.data.products || []);

      } catch (err) {
        console.log(err);
      }
    };

    fetchCart();

  }, []);

  // ✅ UPDATE CART (INCREASE / DECREASE)
  const update = async (id, delta) => {

    let newCart = [...cart];

    const item = newCart.find(i => i._id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
      newCart = newCart.filter(i => i._id !== id);
    }

    setCart(newCart);

    const user = JSON.parse(localStorage.getItem("user"));

    await axios.post("http://localhost:5000/api/cart", {
      userId: user._id,
      products: newCart
    });

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ✅ CLEAR CART
  const clearCart = async () => {

    const user = JSON.parse(localStorage.getItem("user"));

    await axios.post("http://localhost:5000/api/cart", {
      userId: user._id,
      products: []
    });

    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ✅ READ MORE
  const toggleReadMore = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);

  return (

    <div className="p-3 sm:p-6 max-w-5xl mx-auto">

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Shopping Cart
      </h1>

      {/* EMPTY CART */}
      {cart.length === 0 && (

        <div className="text-center mt-20">

          <h2 className="text-xl font-semibold">
            Your cart is empty
          </h2>

          <p className="text-gray-500 mt-2">
            Add some products to start shopping
          </p>

          <button
            onClick={() => navigate("/products")}
            className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700"
          >
            Go to Products
          </button>

        </div>

      )}

      <div className="space-y-4">

        {cart.map((item) => {

          // ✅ IMAGE FIX (IMPORTANT)
          const imageUrl = item.image?.startsWith("http")
            ? item.image
            : `http://localhost:5000/${item.image}`;

          return (

            <div
              key={item._id}
              className="flex flex-col sm:grid sm:grid-cols-12 items-center bg-white shadow-md rounded-lg p-3 sm:p-4 gap-3 sm:gap-4"
            >

              {/* Image */}
              <div className="w-full sm:col-span-2 flex justify-center sm:justify-start">
              <img
                src={
                  item.image
                    ? `http://localhost:5000/uploads/${item.image}`
                    : "https://via.placeholder.com/80"
                }
                alt={item.name}
                className="h-20 w-20 object-cover rounded border"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80";
                }}
              />
            </div>

              {/* Product Info */}
              <div className="w-full sm:col-span-5 text-center sm:text-left">

                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">

                  {expandedItems[item._id]
                    ? item.title || item.name
                    : (item.title || item.name)?.length > TITLE_LIMIT
                      ? (item.title || item.name).slice(0, TITLE_LIMIT) + "..."
                      : item.title || item.name}

                  {(item.title || item.name)?.length > TITLE_LIMIT && (

                    <button
                      onClick={() => toggleReadMore(item._id)}
                      className="text-blue-500 ml-1 text-xs"
                    >
                      {expandedItems[item._id] ? "Read Less" : "Read More"}
                    </button>

                  )}

                </h2>

                <p className="text-gray-500 text-sm">
                  Price: ₹ {item.price}
                </p>

              </div>

              {/* Quantity */}
              <div className="flex justify-center items-center gap-3 sm:col-span-3">

                <button
                  onClick={() => update(item._id, -1)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-lg font-bold"
                >
                  -
                </button>

                <span className="font-semibold text-base min-w-[24px] text-center">
                  {item.qty}
                </span>

                <button
                  onClick={() => update(item._id, 1)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-lg font-bold"
                >
                  +
                </button>

              </div>

              {/* Subtotal */}
              <div className="sm:col-span-2 text-center sm:text-right font-bold text-base sm:text-lg text-indigo-600">
                ₹ {(item.price * item.qty).toFixed(2)}
              </div>

            </div>

          );

        })}

      </div>

      {/* TOTAL */}
      {cart.length > 0 && (

        <div className="mt-8 border-t pt-6">

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-indigo-600">
              ₹ {total.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-4 mt-6">

            <button
              onClick={() => navigate("/checkout")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex-1"
            >
              Proceed to Buy
            </button>

            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
            >
              Clear Cart
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
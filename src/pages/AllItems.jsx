import BASE_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AllItems() {

  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // confirm dialog state
  const [confirm, setConfirm] = useState({ show: false, id: null, name: "" });

  // toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("${BASE_URL}/api/products");
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener("orderUpdated", fetchProducts);
    return () => window.removeEventListener("orderUpdated", fetchProducts);
  }, []);

  // ✅ Step 1: show confirm dialog
  const handleDeleteClick = (id, name) => {
    setConfirm({ show: true, id, name });
  };

  // ✅ Step 2: confirmed → delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/products/${confirm.id}`);
      setItems(items.filter(item => item._id !== confirm.id));
      setConfirm({ show: false, id: null, name: "" });
      showToast("Product deleted successfully!");
    } catch (err) {
      console.log(err);
      setConfirm({ show: false, id: null, name: "" });
      showToast("❌ Error deleting product", "error");
    }
  };

  const cancelDelete = () => {
    setConfirm({ show: false, id: null, name: "" });
  };

  const editProduct = (id) => navigate(`/edit/${id}`);

  return (
    <div className="p-3 sm:p-6">

      {/* ✅ TOAST */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className={`${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white px-6 py-3 rounded-lg shadow-lg font-semibold`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* ✅ CONFIRM DIALOG */}
      {confirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">

            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🗑️</div>
              <h2 className="text-lg font-bold text-gray-800">Delete Product?</h2>
              <p className="text-gray-500 text-sm mt-1">
                Are you sure you want to delete <strong>{confirm.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={cancelDelete}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
              >
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">All Products</h1>

      {/* Mobile: Card layout */}
      <div className="block sm:hidden space-y-3">
        {items.length === 0 ? (
          <div className="text-center p-5 bg-white rounded shadow text-gray-500">No products found</div>
        ) : (
          items.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow p-3 flex items-center gap-3">
              {item.image ? (
                <img
                  src={`${BASE_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="h-16 w-16 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">No img</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">₹ {item.price}</p>
                <p className="text-xs mt-0.5">
                  {item.stock === 0 ? (
                    <span className="text-red-500">Out of Stock</span>
                  ) : item.stock <= 5 ? (
                    <span className="text-orange-500">Low ({item.stock})</span>
                  ) : (
                    <span className="text-gray-600">{item.stock} in stock</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => editProduct(item._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >Edit</button>
                <button
                  onClick={() => handleDeleteClick(item._id, item.name)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                >Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block overflow-x-auto">
      <table className="w-full border shadow-md min-w-[500px]">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="p-3">Image</th>
            <th className="p-3">Title</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Price</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-5">No products found</td>
            </tr>
          ) : (
            items.map(item => (
              <tr key={item._id} className="border-t text-center hover:bg-gray-50">

                <td className="p-3">
                  {item.image ? (
                    <img
                      src={`${BASE_URL}/uploads/${item.image}`}
                      alt={item.name}
                      className="h-20 w-20 object-cover mx-auto rounded"
                    />
                  ) : (
                    <p>No Image</p>
                  )}
                </td>

                <td className="p-3 font-medium">{item.name}</td>

                <td className="p-3">
                  {item.stock === 0 ? (
                    <span className="text-red-500">Out of Stock (0 / {item.originalStock})</span>
                  ) : item.stock <= 5 ? (
                    <span className="text-orange-500">Low ({item.stock} / {item.originalStock})</span>
                  ) : (
                    <span>{item.stock} / {item.originalStock}</span>
                  )}
                </td>

                <td className="p-3">₹ {item.price}</td>

                <td className="p-3">
                  <button
                    onClick={() => editProduct(item._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >Edit</button>
                  <button
                    onClick={() => handleDeleteClick(item._id, item.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >Delete</button>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

    </div>
  );
}
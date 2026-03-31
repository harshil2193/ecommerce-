import BASE_URL from "../config";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditItem() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({ name: "", price: "", description: "", stock: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("stock", product.stock);
      if (image) formData.append("image", image);

      await axios.put(`${BASE_URL}/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showToast("✅ Product Updated Successfully!");
      await new Promise(r => setTimeout(r, 2000));
      navigate("/admin/items");

    } catch (err) {
      console.log(err);
      showToast("❌ Error updating product", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start sm:items-center p-3 sm:p-6">

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto">
          <div className={`${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-center`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-4 sm:p-6 mt-4 sm:mt-0">

        {/* Header */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Product Details</h2>

        {/* Form */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Product Name</label>
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Price (₹)</label>
            <input
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Stock</label>
            <input
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm text-gray-600">Product Image</label>
            <div
              className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition cursor-pointer"
              onClick={() => document.getElementById("editImageInput").click()}
            >
              {preview || product.image ? (
                <img
                  src={preview || `${BASE_URL}/uploads/${product.image}`}
                  alt="preview"
                  className="h-32 mx-auto rounded-lg object-cover"
                />
              ) : (
                <div>
                  <p className="text-3xl mb-1">🖼️</p>
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Click to change image</p>
              <input id="editImageInput" type="file" onChange={handleImage} className="hidden" />
            </div>
          </div>

          <button
            onClick={updateProduct}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold mt-2"
          >
            Update Product
          </button>

        </div>
      </div>
    </div>
  );
}
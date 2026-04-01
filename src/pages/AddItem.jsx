import BASE_URL from '../config.js'
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast";

export default function AddItem() {

  const navigate = useNavigate();

  const [product, setProduct] = useState({ name: "", price: "", description: "", stock: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const addProduct = async () => {
    // ✅ Validation
    const newErrors = {};
    if (!product.name.trim())        newErrors.name        = "Product name is required";
    if (!product.price)              newErrors.price       = "Price is required";
    if (!product.stock)              newErrors.stock       = "Stock is required";
    if (!product.description.trim()) newErrors.description = "Description is required";
    if (!image)                      newErrors.image       = "Product image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("stock", product.stock);
      formData.append("image", image);

      await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setToast({ show: true, message: "Product Added Successfully!", type: "success" });
      await new Promise(r => setTimeout(r, 2000));
      navigate("/admin/items");

    } catch (err) {
      console.log(err);
      setToast({ show: true, message: "❌ Error adding product", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start sm:items-center p-3 sm:p-6">

      <Toast message={toast.message} show={toast.show} type={toast.type} />

      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-4 sm:p-6 mt-4 sm:mt-0">

        {/* Header */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Add New Product</h2>

        {/* Form */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Product Name</label>
            <input
              name="name"
              placeholder="Product Name"
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.name ? "border-red-400" : ""}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Price (₹)</label>
            <input
              name="price"
              placeholder="Price"
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.price ? "border-red-400" : ""}`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Stock</label>
            <input
              type="number"
              placeholder="Stock"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.stock ? "border-red-400" : ""}`}
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              name="description"
              placeholder="Product Description..."
              onChange={handleChange}
              rows={3}
              className={`w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${errors.description ? "border-red-400" : ""}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm text-gray-600">Product Image</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition cursor-pointer"
              onClick={() => document.getElementById("addImageInput").click()}>
              {preview ? (
                <img src={preview} alt="preview" className="h-32 mx-auto rounded-lg object-cover" />
              ) : (
                <div>
                  <p className="text-3xl mb-1">🖼️</p>
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </div>
              )}
              <input id="addImageInput" type="file" onChange={handleImage} className="hidden" />
            </div>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          <button
            onClick={addProduct}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold mt-2"
          >
            Add Product
          </button>

        </div>
      </div>
    </div>
  );
}
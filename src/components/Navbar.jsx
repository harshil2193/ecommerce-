import BASE_URL from "../config";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const updateCartCount = async () => {
    try {
      if (!user || user.role === "admin") { setCartCount(0); return; }
      const res = await axios.get(`${BASE_URL}/api/cart/${user._id}`);
      const cart = res.data || [];
      const total = cart.reduce((sum, item) => sum + item.qty, 0);
      setCartCount(total);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("expiry");
    localStorage.setItem("toastMessage", "Logged Out Successfully!");
    localStorage.setItem("toastType", "success");
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
          className="text-xl sm:text-2xl font-bold text-indigo-600"
          onClick={closeMenu}
        >
          E-Commerce
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5 lg:gap-8 text-gray-700 font-medium">
          {user?.role === "admin" ? (
            <>
              <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Dashboard</Link>
              <Link to="/admin/add" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Add Items</Link>
              <Link to="/admin/items" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">All Items</Link>
              <Link to="/admin/delivery" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Delivery</Link>
              <Link to="/admin/order-history" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Order History</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Dashboard</Link>
              <Link to="/products" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Products</Link>
              <Link to="/cart" className="relative flex items-center gap-2 hover:text-indigo-600 transition-colors text-sm lg:text-base">
                <FaShoppingCart size={18} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none pt-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/my-orders" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">My Orders</Link>
              <Link to="/profile" className="hover:text-indigo-600 transition-colors text-sm lg:text-base">Profile</Link>
            </>
          )}
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm lg:text-base"
          >
            Logout
          </button>
        </div>

        {/* Mobile: Cart icon + Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {user?.role !== "admin" && (
            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 p-1" onClick={closeMenu}>
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 hover:text-indigo-600 p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {user?.role === "admin" ? (
              <>
                <MobileLink to="/admin/dashboard" onClick={closeMenu}>Dashboard</MobileLink>
                <MobileLink to="/admin/add" onClick={closeMenu}>Add Items</MobileLink>
                <MobileLink to="/admin/items" onClick={closeMenu}>All Items</MobileLink>
                <MobileLink to="/admin/delivery" onClick={closeMenu}>Delivery</MobileLink>
                <MobileLink to="/admin/order-history" onClick={closeMenu}>Order History</MobileLink>
              </>
            ) : (
              <>
                <MobileLink to="/dashboard" onClick={closeMenu}>Dashboard</MobileLink>
                <MobileLink to="/products" onClick={closeMenu}>Products</MobileLink>
                <MobileLink to="/cart" onClick={closeMenu}>
                  <span className="flex items-center gap-2">
                    <FaShoppingCart size={16} /> Cart
                    {cartCount > 0 && <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                  </span>
                </MobileLink>
                <MobileLink to="/my-orders" onClick={closeMenu}>My Orders</MobileLink>
                <MobileLink to="/profile" onClick={closeMenu}>Profile</MobileLink>
              </>
            )}
            <button
              onClick={() => { closeMenu(); logout(); }}
              className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-center"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
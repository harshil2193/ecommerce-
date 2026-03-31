import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AddItem from "./pages/AddItem";
import AllItems from "./pages/AllItems";
import AdminOrders from "./pages/AdminOrders";
import EditItem from "./pages/EditItem";
import DeliveryPage from "./pages/DeliveryPage";
import OrderHistory from "./pages/OrderHistory";
import UserOrders from "./pages/UserOrders";

export default function App(){

return(
<>

<Navbar/>

<Routes>
<Route path="/" element={<Login/>}/>
<Route path="/register" element={<Register/>}/>
<Route path="/forgot-password" element={<ForgotPassword/>}/>

<Route element={<ProtectedRoute/>}>
<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/products" element={<Products/>}/>
<Route path="/cart" element={<Cart/>}/>
<Route path="/profile" element={<Profile/>}/>
<Route path="/my-orders" element={<UserOrders/>}/>
<Route path="/checkout" element={<Checkout/>}/>
<Route path="/payment" element={<Payment/>}/>
<Route path="/order-success" element={<OrderSuccess/>}/>
<Route element={<AdminRoute />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/add" element={<AddItem />} />
  <Route path="/admin/items" element={<AllItems />} />
  <Route path="/admin/delivery" element={<DeliveryPage />} />
  <Route path="/admin/order-history" element={<OrderHistory />} />
</Route>
<Route path="/admin/orders" element={<AdminOrders />} />
<Route path="/edit/:id" element={<EditItem />} />


</Route>

</Routes>

</>
)
}
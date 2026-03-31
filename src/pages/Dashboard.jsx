import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast";
import ProductCard from "../components/ProductCard";
import axios from "axios";

export default function Dashboard() {

// GET USER FROM LOCAL STORAGE
const user = JSON.parse(localStorage.getItem("user"));
const expiry = localStorage.getItem("expiry");

const [products, setProducts] = useState([]);
const [loading,setLoading] = useState(true);
const [timeLeft, setTimeLeft] = useState("");

const [toast,setToast] = useState({
show:false,
message:"",
type:"success"
});

const navigate = useNavigate();


// FETCH PRODUCTS FROM YOUR BACKEND
useEffect(() => {

axios.get("http://localhost:5000/api/products")
.then(res => {
    console.log("ADMIN DATA:", res.data); // 🔍 check
setProducts(res.data.slice(0,6)); // show 6 products
setLoading(false);
})
.catch(err => console.log(err));

}, []);


// SESSION TIMER
useEffect(() => {

if(!expiry) return;

const interval = setInterval(() => {

const remaining = expiry - Date.now();

if(remaining <= 0){

localStorage.removeItem("user");
localStorage.removeItem("expiry");

setToast({
show:true,
message:"Session Expired. Please Login Again.",
type:"error"
});

setTimeout(()=>{
navigate("/");
},2000);

clearInterval(interval);

}else{

const minutes = Math.floor(remaining / 60000);
const seconds = Math.floor((remaining % 60000) / 1000);

setTimeLeft(`${minutes}:${seconds.toString().padStart(2,"0")}`);

}

},1000);

return () => clearInterval(interval);

},[]);


return (

<div className="bg-gray-100 min-h-screen p-3 sm:p-6">

{/* Welcome */}
<div className="mb-4 sm:mb-6">
<h1 className="text-xl sm:text-2xl font-bold">
Welcome, {user?.name}
</h1>
</div>

{/* Banner */}
<div className="mb-6 sm:mb-8">
<img
src="../Image/banner.png"
className="w-full h-40 sm:h-56 md:h-72 lg:h-96 object-cover rounded-lg shadow"
/>
</div>

{/* Products */}
<h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
Featured Products
</h2>

{/* Loading */}
{loading ? (
<div className="flex justify-center mt-10">
<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
</div>
) : (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
{products.map(product => (
<ProductCard key={product._id} product={product} />
))}
</div>
)}


{/* Toast */}
<Toast
message={toast.message}
show={toast.show}
type={toast.type}
/>

</div>

);
}
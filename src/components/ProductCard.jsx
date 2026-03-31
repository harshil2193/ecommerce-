import { useEffect, useState } from "react"
import Toast from "../components/toast";
import axios from "axios";

export default function ProductCard({product}){

const [qty,setQty] = useState(0)

const [toast,setToast] = useState({
show:false,
message:"",
type:"success"
})


// ✅ LOAD CART FROM DATABASE
useEffect(()=>{

const fetchCart = async () => {

try{

const user = JSON.parse(localStorage.getItem("user"));
if(!user) return;

const res = await axios.get(`http://localhost:5000/api/cart/${user._id}`);

const cart = res.data || [];

const exist = cart.find(i=>i._id === product._id);

if(exist){
setQty(exist.qty);
}

}catch(err){
console.log(err);
}

};

fetchCart();

},[product._id]);


// ✅ UPDATE CART IN DATABASE
const updateCart = async (newQty) => {

try{

const user = JSON.parse(localStorage.getItem("user"));

if(!user){
alert("Please login first");
return;
}

// get current cart
const res = await axios.get(`http://localhost:5000/api/cart/${user._id}`);
let cart = res.data || [];

const exist = cart.find(i=>i._id === product._id);

if(newQty <= 0){

cart = cart.filter(i=>i._id !== product._id);
setQty(0);

}else{

if(exist){
exist.qty = newQty;
}else{

cart.push({...product, qty:newQty});

// show toast only first time
setToast({
show:true,
message:"Product Added To Cart!",
type:"success"
});

setTimeout(()=>{
setToast(prev=>({...prev,show:false}))
},2000);

}

setQty(newQty);

}

// save to DB
await axios.post("http://localhost:5000/api/cart",{
userId:user._id,
products:cart
});

window.dispatchEvent(new Event("cartUpdated"));

}catch(err){
console.log(err);
alert("Error updating cart");
}

};


return(

<div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col">

<img
src={`http://localhost:5000/uploads/${product.image}`}
className="h-32 sm:h-40 w-full object-contain mx-auto"
/>

<h3 className="text-xs sm:text-sm mt-2 sm:mt-3 h-5 overflow-hidden font-medium">
{product.name}
</h3>

<p className="text-xs text-gray-500 mt-1 h-5 overflow-hidden">
  {product.description}
</p>

<p className="font-bold mt-1 sm:mt-2 text-sm sm:text-base">
₹ {product.price}
</p>

{product.stock <= 5 && product.stock > 0 && (
  <p style={{ color: "red", fontWeight: "bold", fontSize: "x-small" }}>
    Only {product.stock} left!
  </p>
)}

{product.stock === 0 && (
  <p style={{ color: "red", fontWeight: "bold", fontSize: "small" }}>
    Out of Stock!
  </p>
)}

{/* CART BUTTONS */}

{qty === 0 ? (

<button
onClick={() => updateCart(1)}
disabled={product.stock === 0}
className={`mt-2 sm:mt-3 py-1.5 sm:py-2 rounded text-sm font-medium ${
  product.stock === 0
    ? "bg-gray-400 cursor-not-allowed text-white"
    : "bg-blue-500 hover:bg-blue-600 text-white"
}`}
>
{product.stock === 0 ? "Out of Stock" : "Add to Cart"}
</button>

) : (

<div className="flex items-center justify-center gap-4 sm:gap-7 mt-2 sm:mt-3">

<button
onClick={()=>updateCart(qty-1)}
className="bg-gray-300 px-3 py-1 rounded font-bold text-lg"
>
-
</button>

<span className="font-semibold text-base">
{qty}
</span>

<button
onClick={()=>updateCart(qty+1)}
disabled={qty >= product.stock}
className="bg-gray-300 px-3 py-1 rounded font-bold text-lg disabled:opacity-50"
>
+
</button>

</div>

)}

<Toast
message={toast.message}
show={toast.show}
type={toast.type}
/>

</div>

)

}
import { useEffect,useState } from "react"
import ProductCard from "../components/ProductCard"
import Toast from "../components/toast"
import axios from "axios"

export default function Products(){

const [products,setProducts]=useState([])
const [loading,setLoading]=useState(true)

const [toast,setToast] = useState({
show:false,
message:"",
type:"success"
})

// GET PRODUCTS FROM YOUR BACKEND
useEffect(()=>{

axios.get("http://localhost:5000/api/products")
.then(res=>{
    console.log("ADMIN DATA:", res.data); // 🔍 check
setProducts(res.data)
setLoading(false)
})
.catch(err=>console.log(err))

},[])


// ADD TO CART USING API
const add = async (product)=>{

try{

// get logged user
const user = JSON.parse(localStorage.getItem("user"))

if(!user){
alert("Please login first")
return
}

// get existing cart from backend (optional but good)
let cart = []

// check local temp cart (optional)
const existing = JSON.parse(localStorage.getItem("cart")) || []

const exist = existing.find(i=>i._id === product._id)

if(exist){
exist.qty += 1
}else{
existing.push({...product,qty:1})
}

cart = existing

// SAVE TO BACKEND
await axios.post("http://localhost:5000/api/cart",{
userId:user._id,
products:cart
})

// (optional: keep local copy for UI speed)
localStorage.setItem("cart", JSON.stringify(cart))

window.dispatchEvent(new Event("cartUpdated"))

setToast({
show:true,
message:"Product Added To Cart!",
type:"success"
})

setTimeout(()=>{
setToast(prev => ({...prev,show:false}))
},2000)

}catch(err){
console.log(err)
alert("Error adding to cart")
}

}


if(loading){
return(
<div className="flex justify-center items-center min-h-screen">
<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
</div>
)
}


return(

<div className="p-3 sm:p-6">

<h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">All Products</h1>

<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">

{products.map(p=>(
<ProductCard key={p._id} product={p} add={add}/>
))}

</div>

<Toast
message={toast.message}
show={toast.show}
type={toast.type}
/>

</div>

)

}
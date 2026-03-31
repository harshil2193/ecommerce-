import { useState } from "react";
import axios from "axios";

export default function Admin(){

const [product,setProduct] = useState({
name:"",
price:"",
description:"",
image:""
});

const handleChange = (e)=>{
setProduct({...product,[e.target.name]:e.target.value});
};

const addProduct = async () => {

try{

await axios.post("http://localhost:5000/api/products",product);

alert("Product Added Successfully!");

setProduct({
name:"",
price:"",
description:"",
image:""
});

}catch(err){
console.log(err);
alert("Error adding product");
}

};

return(

<div className="p-4 sm:p-6 max-w-xl mx-auto">

<h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Panel</h1>

<div className="space-y-4">

<input
name="name"
placeholder="Product Name"
value={product.name}
onChange={handleChange}
className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
/>

<input
name="price"
placeholder="Price"
value={product.price}
onChange={handleChange}
className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
/>

<textarea
name="description"
placeholder="Description"
value={product.description}
onChange={handleChange}
rows={3}
className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
/>

<input
name="image"
placeholder="Image URL"
value={product.image}
onChange={handleChange}
className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
/>

<button
onClick={addProduct}
className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 w-full sm:w-auto font-medium"
>
Add Product
</button>

</div>

</div>

);
}
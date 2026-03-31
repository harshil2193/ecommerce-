import { useNavigate } from "react-router-dom";

export default function Payment(){

const navigate = useNavigate();

const placeOrder = () => {

localStorage.removeItem("cart");

window.dispatchEvent(new Event("cartUpdated"));

navigate("/order-success");

};

return(

<div className="max-w-2xl mx-auto p-4 sm:p-6">

<h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
Payment Method
</h1>

<div className="space-y-4">

<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
<input type="radio" name="payment" className="accent-indigo-600"/>
<span>Cash on Delivery</span>
</label>

<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
<input type="radio" name="payment" className="accent-indigo-600"/>
<span>Credit / Debit Card</span>
</label>

<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
<input type="radio" name="payment" className="accent-indigo-600"/>
<span>UPI Payment</span>
</label>

<button
onClick={placeOrder}
className="bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 mt-4 font-semibold"
>
Place Order
</button>

</div>

</div>

);
}
import { Link } from "react-router-dom";

export default function OrderSuccess(){

return(

<div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">

<div className="text-5xl sm:text-6xl mb-4">🎉</div>

<h1 className="text-2xl sm:text-3xl font-bold text-green-600">
Order Placed Successfully!
</h1>

<p className="text-gray-600 mt-3 text-sm sm:text-base max-w-sm">
Thank you for shopping with us. Your order is being processed.
</p>

<Link
to="/products"
className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg mt-6 hover:bg-indigo-700 font-medium transition-colors"
>
Continue Shopping
</Link>

</div>

);
}
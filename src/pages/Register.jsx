import BASE_URL from "../config";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "../components/toast";
import axios from "axios";

export default function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [showConfirmPassword,setShowConfirmPassword] = useState(false);
const [errors,setErrors] = useState({});
const [toast,setToast] = useState({show:false,message:"",type:""});

const register = async (e) => {

e.preventDefault();

let newErrors = {};

if(!name){
newErrors.name = "Name is required";
}

if(!email){
newErrors.email = "Email is required";
}

if(!password){
newErrors.password = "Password is required";
}

if(!confirmPassword){
newErrors.confirmPassword = "Please confirm your password";
} else if(password && confirmPassword && password !== confirmPassword){
newErrors.confirmPassword = "Passwords do not match";
}

if(Object.keys(newErrors).length > 0){
setErrors(newErrors);
return;
}

try{

// ✅ CALL BACKEND API
await axios.post("${BASE_URL}/api/register",{
name,
email,
password
});

// ✅ SUCCESS TOAST
setToast({
show:true,
message:"Registration successful!",
type:"success"
});

// store message for login page
localStorage.setItem("toastMessage","Registration successful!");
localStorage.setItem("toastType","success");

// redirect
setTimeout(()=>{
navigate("/");
},1500);

}catch(err){

// ✅ HANDLE DUPLICATE EMAIL
setErrors({email:"Email already exists"});

}

};


return(

<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

<div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">

<div className="text-center mb-6">

<h1 className="text-2xl font-bold text-indigo-600">
E-Commerce
</h1>

<p className="text-gray-500 text-sm mt-1">
Create your account
</p>

</div>

<form onSubmit={register} className="space-y-4">

<div>

<label className="text-sm text-gray-600">
Name
</label>

<input
type="text"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Enter your name"
/>

{errors.name && (
<p className="text-red-500 text-sm">{errors.name}</p>
)}

</div>

<div>

<label className="text-sm text-gray-600">
Email
</label>

<input
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Enter your email"
/>

{errors.email && (
<p className="text-red-500 text-sm">{errors.email}</p>
)}

</div>

<div>

<label className="text-sm text-gray-600">
Password
</label>

<div className="relative">

<input
type={showPassword ? "text":"password"}
value={password}
onChange={(e)=>{setPassword(e.target.value); setErrors({...errors,password:"",confirmPassword:""});}}
className="w-full border rounded-lg p-3 mt-1 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Enter your password"
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-indigo-600 p-1"
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</button>

</div>

{errors.password && (
<p className="text-red-500 text-sm">{errors.password}</p>
)}

</div>

<div>

<label className="text-sm text-gray-600">
Confirm Password
</label>

<div className="relative">

<input
type={showConfirmPassword ? "text":"password"}
value={confirmPassword}
onChange={(e)=>{setConfirmPassword(e.target.value); setErrors({...errors,confirmPassword:""});}}
className={`w-full border rounded-lg p-3 mt-1 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-base ${
  confirmPassword && password && confirmPassword === password
    ? "border-green-400 focus:ring-green-400"
    : confirmPassword && password && confirmPassword !== password
    ? "border-red-400 focus:ring-red-400"
    : ""
}`}
placeholder="Re-enter your password"
/>

<button
type="button"
onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-indigo-600 p-1"
>
{showConfirmPassword ? <FaEyeSlash/> : <FaEye/>}
</button>

</div>

{/* Live match feedback */}
{confirmPassword && password && confirmPassword === password && (
<p className="text-green-500 text-sm mt-1 flex items-center gap-1">
  ✓ Passwords match
</p>
)}

{errors.confirmPassword && (
<p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
)}

</div>

<button
type="submit"
className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium text-base transition-colors"
>
Register
</button>

</form>

<p className="text-sm text-center mt-4">

Already have an account?

<Link to="/" className="text-indigo-600 ml-1 hover:underline font-medium">
Login
</Link>

</p>

</div>

<Toast
message={toast.message}
type={toast.type}
show={toast.show}
/>

</div>

);
}
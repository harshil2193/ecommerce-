import BASE_URL from '../config.js'
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "../components/toast";
import axios from "axios";

export default function Login(){

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [errors,setErrors] = useState({});

const [toast,setToast] = useState({
show:false,
message:"",
type:"success"
});


// SHOW LOGOUT MESSAGE (FROM localStorage)
useEffect(()=>{

const message = localStorage.getItem("toastMessage");
const type = localStorage.getItem("toastType");

if(message){

setToast({
show:true,
message:message,
type:type
});

localStorage.removeItem("toastMessage");
localStorage.removeItem("toastType");

setTimeout(()=>{
setToast(prev => ({...prev,show:false}));
},2000);

}

},[]);


// LOGIN FUNCTION (API BASED)
const login = async () => {

let newErrors = {};

if(!email){
newErrors.email = "Email is required";
}

if(!password){
newErrors.password = "Password is required";
}

if(Object.keys(newErrors).length > 0){
setErrors(newErrors);
return;
}


// ADMIN LOGIN CHECK
if(email === "admin" && password === "admin"){

const adminUser = {
name:"Admin",
email:"admin",
role:"admin"
};

localStorage.setItem("user", JSON.stringify(adminUser));
localStorage.setItem("expiry", Date.now() + 60 * 60 * 1000);

// redirect to admin
navigate("/admin/dashboard");

return;
}



try{

const res = await axios.post(`${BASE_URL}/api/login`,{
  email: email,
  password: password
});

// SAVE USER SESSION
localStorage.setItem("user", JSON.stringify(res.data));

// optional expiry
localStorage.setItem("expiry", Date.now() + 10 * 60 * 1000);

// SUCCESS
navigate("/dashboard");

}catch(err){

setErrors({general:"Invalid email or password"});

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
Login to your account
</p>

</div>


<div className="mb-4">

<label className="text-sm text-gray-600">
Email
</label>

<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e)=>{
setEmail(e.target.value);
setErrors({...errors,email:""});
}}
className="w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
/>

{errors.email && (
<p className="text-red-500 text-sm mt-1">
{errors.email}
</p>
)}

</div>


<div className="mb-4">

<label className="text-sm text-gray-600">
Password
</label>

<div className="relative">

<input
type={showPassword ? "text" : "password"}
placeholder="Enter your password"
value={password}
onChange={(e)=>{
setPassword(e.target.value);
setErrors({...errors,password:""});
}}
className="w-full border rounded-lg p-3 mt-1 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
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
<p className="text-red-500 text-sm mt-1">
{errors.password}
</p>
)}

<div className="text-right mt-1">
<Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
Forgot Password?
</Link>
</div>

</div>


{errors.general && (
<p className="text-red-500 text-sm mb-3">
{errors.general}
</p>
)}


<button
onClick={login}
className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium text-base"
>
Login
</button>


<p className="text-sm text-center mt-4 text-gray-600">

Don't have an account?

<Link
to="/register"
className="text-indigo-600 ml-1 hover:underline font-medium"
>
Register
</Link>

</p>

</div>


<Toast
message={toast.message}
show={toast.show}
type={toast.type}
/>

</div>

);
}
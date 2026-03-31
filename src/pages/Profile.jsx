import { useState } from "react";
import Toast from "../components/toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

export default function Profile(){

// ✅ Get logged user
const storedUser = JSON.parse(localStorage.getItem("user"));

const [name,setName] = useState(storedUser?.name || "");
const [email,setEmail] = useState(storedUser?.email || "");
const [password,setPassword] = useState(storedUser?.password || "");

const [showPassword,setShowPassword] = useState(false);
const [errors,setErrors] = useState({});

const [toast,setToast] = useState({
show:false,
message:"",
type:"success"
});


// ✅ SAVE FUNCTION (UPDATE DB)
const save = async () => {

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

if(Object.keys(newErrors).length > 0){
setErrors(newErrors);
return;
}

try{

// ✅ Call backend API
const res = await axios.post("http://localhost:5000/api/update-user",{
userId: storedUser._id,
name,
email,
password
});

// ✅ Update localStorage with new data
localStorage.setItem("user", JSON.stringify(res.data));

// ✅ Show success message
setToast({
show:true,
message:"Profile Updated Successfully!",
type:"success"
});

// auto hide toast
setTimeout(()=>{
setToast(prev=>({...prev,show:false}));
},2000);

}catch(err){
console.log(err);

setToast({
show:true,
message:"Error updating profile!",
type:"error"
});

}

};


return(

<div className="min-h-screen bg-gray-100 flex justify-center items-start sm:items-center p-4">

<div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6 sm:p-8 mt-4 sm:mt-0">

{/* Profile Header */}
<div className="flex flex-col items-center mb-6">

<div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
{name?.charAt(0)?.toUpperCase()}
</div>

<h2 className="text-xl font-semibold mt-3">
{name}
</h2>

<p className="text-gray-500 text-sm">
User Profile
</p>

</div>


{/* Form */}
<div className="space-y-4">

{/* Name */}
<div>
<label className="text-sm text-gray-600">Name</label>

<input
value={name}
onChange={(e)=>{
setName(e.target.value);
setErrors({...errors,name:""});
}}
className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Your name"
/>

{errors.name && (
<p className="text-red-500 text-sm">{errors.name}</p>
)}

</div>


{/* Email */}
<div>
<label className="text-sm text-gray-600">Email</label>

<input
value={email}
onChange={(e)=>{
setEmail(e.target.value);
setErrors({...errors,email:""});
}}
className="w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Your email"
/>

{errors.email && (
<p className="text-red-500 text-sm">{errors.email}</p>
)}

</div>


{/* Password */}
<div>
<label className="text-sm text-gray-600">Password</label>

<div className="relative">

<input
type={showPassword ? "text" : "password"}
value={password}
onChange={(e)=>{
setPassword(e.target.value);
setErrors({...errors,password:""});
}}
className="w-full border rounded-lg p-3 mt-1 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
placeholder="Your password"
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


{/* Button */}
<button
onClick={save}
className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium text-base transition-colors"
>
Update Profile
</button>

</div>

</div>


{/* Toast */}
<Toast
message={toast.message}
show={toast.show}
type={toast.type}
/>

</div>

);
}
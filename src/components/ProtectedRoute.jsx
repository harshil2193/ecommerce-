import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute(){

// ✅ get user + expiry
const user = JSON.parse(localStorage.getItem("user"));
const expiry = localStorage.getItem("expiry");

// ❌ if no user → redirect
if(!user){
return <Navigate to="/" />;
}

// ❌ if expired → logout
if(expiry && Date.now() > expiry){

localStorage.removeItem("user");
localStorage.removeItem("expiry");

return <Navigate to="/" />;
}

// ✅ allow access
return <Outlet/>;
}
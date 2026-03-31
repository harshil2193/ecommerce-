import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute(){

const user = JSON.parse(localStorage.getItem("user"));

// not logged in
if(!user){
return <Navigate to="/" />;
}

// not admin
if(user.role !== "admin"){
return <Navigate to="/dashboard" />;
}

// admin allowed
return <Outlet />;
}
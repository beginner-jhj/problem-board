import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router";

export default function Protector({children}){
    const {user} = useAuth();
    return user?children:<Navigate to="/login" />;
}
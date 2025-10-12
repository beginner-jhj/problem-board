import { createContext,useContext, useEffect, useState } from "react";
import { onAuthStateChange,signup,signin,logout } from "../firebase/auth";

const AuthContext = createContext();

export default function AuthProvider({children}){
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const unsubscribe = onAuthStateChange((user)=>{
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    },[]);

    const value = {
        user,
        signup,
        signin,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading&&children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
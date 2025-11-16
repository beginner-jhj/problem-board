import { createContext,useContext, useEffect, useState } from "react";
import { onAuthStateChange,signup,signin,logout } from "../firebase/auth";
import { getUserProfile, createUserProfile } from "../firebase/userHandler";

const AuthContext = createContext();

export default function AuthProvider({children}){
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const unsubscribe = onAuthStateChange(async (user)=>{
            if (user) {
                // Check if user profile exists in Firestore, create if not
                try {
                    await getUserProfile(user.uid);
                } catch (error) {
                    // Profile doesn't exist, create it
                    if (error.code === "user/profile-not-found") {
                        try {
                            await createUserProfile(user.uid, {
                                displayName: user.displayName || "Unknown User",
                                email: user.email || "",
                            });
                            console.log("Auto-created user profile for:", user.uid);
                        } catch (createError) {
                            console.error("Failed to auto-create user profile:", createError);
                        }
                    }
                }
            }
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
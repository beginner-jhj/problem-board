import { useState, useEffect } from "react";

export default function ErorrAlert({isOpen, message}){
    const [open, setOpen] = useState(isOpen);
    useEffect(()=>{
        const timer = setTimeout(()=>{
            setOpen(false);
        },3000);
        return ()=>clearTimeout(timer);
    },[open]);
    return (
        <div className={   `fixed top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-md ${open?"":"hidden"}`}>
            {open&&<p>{message}</p>}
        </div>
    )
}
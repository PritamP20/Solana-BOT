import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs"

interface Prompt {
    id: string;
    content: string;
    type: "USER" | "SYSTEM";
    createdAt: Date;
    actions: Action[];
}

interface Action{
    id:string,
    content:string,
    createdAt:Date
}

export async function usePrompts(projectId:string){
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const {getToken} = useAuth()
    useEffect(()=>{
        const getPrompts = async ()=>{

            const token = await getToken()
            const response = await axios(`${BACKEND_URL}/prompts/${projectId}`,{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
            setPrompts(response.data.prompts);
        }

        let interval = setInterval(getPrompts, 1000)
        return ()=>clearInterval(interval)
    },[])
    return prompts
}
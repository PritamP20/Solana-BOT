import { useEffect, useState } from "react";
import {useAuth} from "@clerk/nextjs"
import axios from "axios";
import { BACKEND_URL } from "@/config";

interface Actions{
    id :string,
    content:string,
    createdAt:Date}
export function useActions(projectId:string){
    const [actions, setActions] = useState<Actions[]>([]);
    const {getToken} = useAuth()
    useEffect(()=>{
        const getActions = async()=>{
            const token = await getToken()
            const response = await axios.get(`${BACKEND_URL}/actions/${projectId}`,{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
            return response.data.actions;
        }

        const interval = setInterval(async () => {
            const newActions = await getActions();
            setActions(newActions);
        }, 1000);
        return () => clearInterval(interval);
    }, [projectId, getToken]);
    return actions;
}
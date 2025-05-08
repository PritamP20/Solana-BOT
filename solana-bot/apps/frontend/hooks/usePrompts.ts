import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs"

interface Prompt {
    id: string;
    content: string;
    type: "USER" | "SYSTEM";
    createdAt: Date;
}

export function usePrompts(projectId: string) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const { getToken } = useAuth();
    
    useEffect(() => {
        let isMounted = true;
        
        const getPrompts = async () => {
            if (!projectId) {
                console.warn("No projectId provided to usePrompts");
                return [];
            }
            
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Authentication token not available");
                }
                
                const response = await axios.get(
                    `${BACKEND_URL}/prompts/${projectId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );
                
                console.log("Prompts response:", response.data);
                return response.data.prompts || [];
            } catch (err) {
                console.error("Error fetching prompts:", err);
                return [];
            }
        };

        const interval = setInterval(async () => {
            if (isMounted) {
                const newPrompts = await getPrompts();
                if (isMounted && newPrompts) {
                    // Ensure we're getting an array
                    const promptsArray = Array.isArray(newPrompts) ? newPrompts : [];
                    setPrompts(promptsArray);
                }
            }
        }, 2000);
        
        // Initial fetch
        getPrompts().then(initialPrompts => {
            if (isMounted && initialPrompts) {
                const promptsArray = Array.isArray(initialPrompts) ? initialPrompts : [];
                setPrompts(promptsArray);
            }
        });

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [projectId, getToken]);
    
    // Return the prompts array directly to match your component's expectation
    return prompts;
}
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState,  } from "react"
import { useRouter } from 'next/navigation';
import axios from "axios"
import { BACKEND_URL } from "@/config"

const FormSchema = z.object({
  bio: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 30 characters.",
    }),
})

export function Prompt() {
  const [prompt, setPrompt] = useState("")

  const { getToken } = useAuth()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()  

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto" // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  async function createProject() {
    console.log("submitting")
    const token = await getToken()
    console.log(token)
    try {
      const response = await axios.post(
        `${BACKEND_URL}/project`,
        {
          prompt: prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log(response)
      router.push(`/project/${response.data.projectId}`)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value)
          }}
          placeholder="Describe what you want to build..."
          rows={1}
          className="w-full p-2 text-xl rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700 dark:placeholder-gray-500 transition-all duration-200 resize-none overflow-hidden"
        />
        <Button onClick={e=>createProject()}>Submit</Button>
    </div>
  )
}

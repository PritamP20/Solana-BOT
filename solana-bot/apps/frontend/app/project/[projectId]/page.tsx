"use client"
import { useActions } from '@/hooks/useAction'
import { usePrompts } from '@/hooks/usePrompts'
import React, { FC, use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import axios from 'axios'
import { WORKER_URL } from '@/config'


const page:FC<{ params: Promise<{ projectId: string }> }> = ({params}) => {
    const { projectId } = use(params); 
    const prompts = usePrompts(projectId)
    const action = useActions(projectId)

    const [prompt, setPrompt] = useState("")

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const perplxityResponse = async()=>{
      try {
        console.log("running perplexity response function");
        const response = await axios.post(`${WORKER_URL}/prompt`,{
          prompt:prompt,
          projectId:projectId
        })
        console.log("response from callign perplixity function res: ",response)
      } catch (error) {
        console.log("error from perplexity res: ",error)
      }
    }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto" // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])
  return (
    <div className='h-screen  flex justify-between'>
      <div className=' flex-1/4 p-8 flex flex-col justify-between '>
        <div className='mb-4 h-[85vh] flex flex-col justify-around'>
            <div>
                <p>Action</p>
                {Array.isArray(action) && action.map((a, i) => <div key={a.id || i}>{a.content}</div>)}
            </div>
            <div>
                <p>Prompts</p>
                {Array.isArray(prompts) && prompts.map((p, i) => <div key={p.id || i}>{p.content}</div>)}
            </div>
        </div>
        <div className='flex gap-2'>
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                    setPrompt(e.target.value)
                }}
                placeholder="Describe what you want to build..."
                rows={1}
                className="w-full p-2 text-sm rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700 dark:placeholder-gray-500 transition-all duration-200 resize-none overflow-hidden"
            />
            <Button className='text-xs' onClick={e=>perplxityResponse()}><Send></Send></Button>
        </div>
      </div>
      <iframe src={`http://localhost:8080/`} className='flex-11/12 my-auto h-[95vh]'></iframe>
    </div>
  )
}


export default page

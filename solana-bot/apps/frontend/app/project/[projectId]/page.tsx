"use client"
import { useActions } from '@/hooks/useAction'
import { usePrompts } from '@/hooks/usePrompts'
import React, { FC, use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Code, Command, FilePlus, Folder, LayoutList, Loader2, MessageSquare, RefreshCw, Send } from 'lucide-react'
import axios from 'axios'
import { WORKER_URL } from '@/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const ProjectPage: FC<{ params: Promise<{ projectId: string }> }> = ({ params }) => {
  const { projectId } = use(params)
  // const projectId = "ae0e8a46-115c-4519-8454-eb3d0033674f"
  const prompts = usePrompts(projectId)
  const actions = useActions(projectId)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("prompts")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const perplexityResponse = async () => {
    if (!prompt.trim()) return
    
    try {
      setIsLoading(true)
      console.log("Sending prompt to perplexity")
      
      const response = await axios.post(`${WORKER_URL}/prompt`, {
        prompt: prompt,
        projectId: projectId
      })
      
      console.log("Response received:", response)
      setPrompt("")
      setIsLoading(false)
    } catch (error) {
      console.error("Error from perplexity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      perplexityResponse()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [prompt])

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-[340px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Command className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-lg">Project Assistant</h2>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="prompts" className="text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-sm">
              <Code className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="flex-1 flex flex-col mt-0 ">
            <ScrollArea className="flex-1 p-4">
              {!prompts || prompts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">No conversation yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Start by sending a prompt below</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y max-h-[70vh]">
                  {prompts.map((prompt, index) => (
                    <div 
                      key={prompt.id}
                      className={`rounded-lg p-2 ${
                        prompt.type === "USER" 
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900" 
                          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            prompt.type === "USER" 
                              ? "bg-blue-500" 
                              : "bg-gray-500"
                          }`}>
                            {prompt.type === "USER" ? "U" : "S"}
                          </div>
                        </Avatar>
                        <span className="text-xs font-light">
                          {prompt.type === "USER" ? "You" : "System"}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(prompt.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm pl-8">{prompt.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 flex flex-col mt-0 max-h-[75vh] overflow-y-auto">
            <ScrollArea className="flex-1 p-4">
              {!actions || actions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Folder className="h-10 w-10 text-gray-300 mb-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">No actions yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Actions will appear here as they are created</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div 
                      key={action.id || index}
                      className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">Action {index + 1}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {action.createdAt && new Date(action.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm pl-6 font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded-md overflow-x-auto">
                        {action.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              rows={1}
              disabled={isLoading}
              className="w-full p-3 pr-10 text-sm rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 transition-all duration-200 resize-none overflow-hidden"
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={perplexityResponse}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="h-12 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Code Editor</span>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
        
        {/* Iframe */}
        <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-900">
          <iframe 
            src={`http://localhost:8080/`} 
            className="w-full h-full rounded-lg shadow-md border border-gray-200 dark:border-gray-800 bg-white"
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectPage
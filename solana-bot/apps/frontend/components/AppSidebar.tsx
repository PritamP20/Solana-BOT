"use client"
import { Calendar, Home, Inbox, Search, Settings, Folder } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "@/config"

const navigationItems = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { getToken } = useAuth()
  
  useEffect(() => {
    const getProjects = async () => {
      setIsLoading(true)
      const token = await getToken()
      try {
        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        console.log("Project Response: ", response.data)
        setProjects(response.data.project || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getProjects()
  }, [getToken])

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarContent>
        {/* Navigation Items */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 uppercase tracking-wide text-sm px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 uppercase tracking-wide text-sm px-4 py-2 flex justify-between">
            <span>My Projects</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 text-xs">
              {isLoading ? "..." : projects.length}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No projects found</div>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/project/${project.id}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Folder className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{project.description || "Untitled Project"}</span>
                          <span className="text-xs text-gray-500">
                            {project.type} • {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
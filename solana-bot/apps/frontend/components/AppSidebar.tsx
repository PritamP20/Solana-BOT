"use client";

import { useEffect, useState } from "react";
import { Calendar, Home, Inbox, Search, Settings, Folder, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BACKEND_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  
  useEffect(() => {
    const getProjects = async () => {
      setIsLoading(true);
      const token = await getToken();
      try {
        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        setProjects(response.data.project || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getProjects();
  }, [getToken]);

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0">
      <div className="py-4 px-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">AI</span>
          </div>
          <span className="font-semibold text-lg">AppBuilder</span>
        </div>
      </div>
      
      <SidebarContent className="py-2">
        {/* Navigation Items */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
          <div className="px-4 py-2 flex items-center justify-between">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              My Projects
            </SidebarGroupLabel>
            <div className="flex gap-2 items-center">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              ) : (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs font-medium">
                  {projects.length}
                </span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new project</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center mb-2">
                    <Folder className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p>No projects yet</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Project
                  </Button>
                </div>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/project/${project.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {project.description || "Untitled Project"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
      
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">User Account</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">user@example.com</span>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
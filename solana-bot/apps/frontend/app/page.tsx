'use client';
import { useEffect } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AppBar from "@/components/AppBar";
import {Prompt} from "@/components/Prompt";
import TemplateButton from "@/components/TemplateButton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Hero from "@/components/Hero";

export default function Home() {
  useEffect(() => {
    const ids = ['float1', 'float2', 'float3', 'float4'];

    const moveRandomly = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      const move = () => {
        const x = Math.random() * window.innerWidth - 50;
        const y = Math.random() * window.innerHeight - 50;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };

      move();
      setInterval(move, 4000 + Math.random() * 3000); // Every 4–7s
    };

    ids.forEach(moveRandomly);
  }, []);
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="max-w-max-2xl  w-full min-h-screen flex flex-col ">
        <AppBar></AppBar>
          <Hero />

    

      </main>
      
    </SidebarProvider>


  );
}

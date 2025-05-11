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
import { useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Setup background floating elements
    const floatingElements = [
      { id: 'floating-1', delay: 0, duration: 15 },
      { id: 'floating-2', delay: 2, duration: 18 },
      { id: 'floating-3', delay: 4, duration: 20 },
      { id: 'floating-4', delay: 1, duration: 22 }
    ];
    
    // Cleanup function for animation intervals
    const intervals = [];
    
    floatingElements.forEach(el => {
      const element = document.getElementById(el.id);
      if (element) {
        const moveElement = () => {
          const xPos = Math.random() * 80;
          const yPos = Math.random() * 80;
          element.style.transform = `translate(${xPos}%, ${yPos}%)`;
        };
        
        // Initial position
        moveElement();
        
        // Set interval for continuous movement
        const interval = setInterval(moveElement, el.duration * 1000);
        intervals.push(interval);
      }
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, []);


  return (
    <SidebarProvider>
      <div className="absolute inset-0 -z-10 bg-white dark:bg-gray-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Floating gradient orbs */}
        <div id="floating-1" className={`absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 blur-3xl transition-transform duration-[15000ms] ease-in-out ${mounted ? 'opacity-70' : 'opacity-0'}`} style={{ top: '10%', left: '10%' }} />
        <div id="floating-2" className={`absolute w-64 h-64 rounded-full bg-gradient-to-r from-green-400/20 to-blue-500/20 blur-3xl transition-transform duration-[18000ms] ease-in-out ${mounted ? 'opacity-70' : 'opacity-0'}`} style={{ top: '60%', left: '60%' }} />
        <div id="floating-3" className={`absolute w-72 h-72 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-500/20 blur-3xl transition-transform duration-[20000ms] ease-in-out ${mounted ? 'opacity-70' : 'opacity-0'}`} style={{ top: '40%', left: '20%' }} />
        <div id="floating-4" className={`absolute w-80 h-80 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 blur-3xl transition-transform duration-[22000ms] ease-in-out ${mounted ? 'opacity-70' : 'opacity-0'}`} style={{ top: '10%', left: '70%' }} />
      </div>
      <AppSidebar />
      <main className="max-w-max-2xl  w-full min-h-screen flex flex-col ">
        <AppBar></AppBar>
          <Hero />

    

      </main>
      
    </SidebarProvider>


  );
}

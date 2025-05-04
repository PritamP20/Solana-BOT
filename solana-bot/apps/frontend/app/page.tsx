import Image from "next/image";
import { Button } from "@/components/ui/button";
import AppBar from "@/components/AppBar";
import {Prompt} from "@/components/Prompt";
import TemplateButton from "@/components/TemplateButton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="max-w-max-2xl pt-2 w-full min-h-screen flex flex-col ">
        <AppBar></AppBar>
          <Hero />
      </main>
    </SidebarProvider>


  );
}

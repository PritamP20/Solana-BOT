"use client"

import { useState } from "react";
import { ArrowRight, Sparkles, Code, Layout } from "lucide-react";
import AppBar from "./AppBar";
import { Prompt } from "./Prompt";
import TemplateButton from "./TemplateButton";
import { Button } from "./ui/button";

const Hero = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // This would be connected to your actual submission logic
  // const handleGenerateClick = () => {
  //   setIsLoading(true);
  //   // Simulate API call
  //   setTimeout(() => setIsLoading(false), 2000);
  // };

  return (
    <section className="relative max-w-5xl px-6 pt-10 pb-16 mx-auto text-center w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#0a0a0a]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>
      
      
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-muted">
          <Sparkles size={14} className="mr-1.5 text-primary" />
          <span>Build apps in seconds</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
          Transform your ideas into <br className="hidden sm:inline" /> 
          <span className="text-primary">working applications</span>
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter a prompt describing what you want to build, click generate, and watch as your 
          application comes to life with just a few words.
        </p>
      </div>

      <div className="mt-10 w-full sm:w-5/6 lg:w-4/5 mx-auto">
        <div className="p-4 rounded-xl bg-slate-50 shadow-sm border dark:bg-slate-900/50 dark:border-slate-800">
          <Prompt />
          
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="inline-flex items-center">
          <Code size={14} className="mr-1.5 text-primary" />
          <span className="text-muted-foreground">Or try a template:</span>
        </div>
        <TemplateButton />
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="p-4 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-800">
            <feature.icon size={20} className="mb-3 text-primary" />
            <h3 className="font-medium mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const features = [
  {
    title: "AI-Powered",
    description: "Intelligent code generation that understands your requirements",
    icon: Sparkles
  },
  {
    title: "Fully Customizable",
    description: "Edit and modify the generated applications to your liking",
    icon: Code
  },
  {
    title: "Responsive Design",
    description: "Applications that work perfectly on all screen sizes",
    icon: Layout
  }
];

export default Hero;
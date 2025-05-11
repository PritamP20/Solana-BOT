import { useState, useEffect } from "react";
import { Sparkles, Code, Layout, ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Prompt } from "./Prompt";
import TemplateButton from "./TemplateButton";
import {
  SignInButton,
} from '@clerk/nextjs'
import { Button } from "./ui/button";

const Hero = () => {
  const {getToken} = useAuth()

  const [token, setToken] = useState<string | null>(null)
  
    useEffect(() => {
      const fetchToken = async () => {
        const newToken = await getToken()
        setToken(newToken)
      }
      fetchToken()
    }, [getToken])
  

  return (
    <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      {/* Animated background gradient */}
      
      
      {/* Hero content */}
      <div className="relative z-10 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-2 text-sm font-medium rounded-full bg-primary/10 text-primary">
            <Sparkles size={16} className="mr-2" />
            <span>Build Contracts in seconds</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl lg:leading-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-300 dark:to-gray-400">
            Transform your ideas into <br className="hidden sm:inline" /> 
            <span className="text-primary">Solana Programs</span>
          </h1>
          
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter a prompt describing what you want to build, click generate, and watch as your 
            Contract comes to life with just a few words.
          </p>
        </div>

        {token ?<div className="mt-12 w-full sm:w-5/6 lg:w-4/5 mx-auto">
          <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
            <Prompt />
          </div>
        </div>:
        
          <div className="  text-gray-600 dark:text-gray-300">
              <Button variant={"outline"} className="p-3 mt-3"><SignInButton >GetStarted</SignInButton></Button>
          </div>
        }

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="inline-flex items-center">
            <Code size={16} className="mr-2 text-primary" />
            <span className="text-gray-600 dark:text-gray-300">Or try a template:</span>
          </div>
          <TemplateButton />
        </div>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-900/90 dark:border-gray-800">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const features = [
  {
    title: "AI-Powered Contracts",
    description: "Generate secure and efficient smart contracts based on your input and project goals.",
    icon: Sparkles,
  },
  {
    title: "Fully Customizable",
    description: "Easily edit contract logic and parameters to suit your exact requirements.",
    icon: Code,
  },
  {
    title: "Responsive Dashboard",
    description: "Interact with and deploy your contracts from a sleek, responsive UI across all devices.",
    icon: Layout,
  },
];
export default Hero;
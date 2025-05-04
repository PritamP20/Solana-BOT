// components/Hero.tsx
"use client"
import AppBar from "./AppBar";
import { Prompt } from "./Prompt";
import TemplateButton from "./TemplateButton";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="max-w-4xl px-4 pt-32 mx-auto text-center w-full">
  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
    What do you want to build?
  </h1>
  <p className="mt-4 text-base text-muted-foreground sm:text-lg">
    Enter a prompt, click generate, and watch your app come to life.
  </p>

  <div className="mt-8 w-full sm:w-4/5 mx-auto">
    <Prompt />
    {/* No need for onClick here, the form handles submission */}
  
  </div>

  <div className="mt-6 flex justify-center">
    <TemplateButton />
  </div>
</section>

  );
};

export default Hero;

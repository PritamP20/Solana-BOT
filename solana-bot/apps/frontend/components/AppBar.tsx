"use client"
import React from 'react'
import { Button } from './ui/button'
import { type Metadata } from 'next'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes"
const AppBar = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div className='flex justify-between items-center p-4 backdrop-blur-3xl '>
      <div className='flex justify-center items-center '> 
        <SidebarTrigger /> <span>Solana</span>
      </div>
      <div>
      <header className="flex justify-end items-center p-3 gap-4 h-8">
        <Button onClick={e=>setTheme(prev=> prev=="light"? "dark":"light")}>Theme</Button>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
      </div>
    </div>
  )
}

export default AppBar

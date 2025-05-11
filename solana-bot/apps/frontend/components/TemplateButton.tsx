"use client"
import React from 'react'
import { Button } from './ui/button'

const TemplateButton = () => {
    const buttons = [{
        label:"Program Mission Sindoor",
        link:"#"
    },{
        label:"Stake Betting Contract",
        link:"#"
    },{
        label:"Build a Escrow Contract",
        link:"#"
    }]
  return (
    <div className="flex gap-2">
      {buttons.map((item) => (
        <Button
          key={item.label}
          onClick={() => window.location.href = item.link}
          variant="secondary"
        >
          {item.label}
        </Button>
      ))}
    </div>

  )
}

export default TemplateButton

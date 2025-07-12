import React from 'react';
import { Badge } from "./ui/badge";

interface NibogLogoProps {
  className?: string;
}

export function NibogLogo({ className }: NibogLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        width="180" 
        height="60" 
        viewBox="0 0 180 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-auto"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="22" fill="#F0F9FF" />
        
        {/* Baby face */}
        <circle cx="24" cy="20" r="8" fill="#FFE0B2" />
        <circle cx="21" cy="18" r="1.5" fill="#5D4037" />
        <circle cx="27" cy="18" r="1.5" fill="#5D4037" />
        <path d="M21 24Q24 26 27 24" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Pacifier */}
        <circle cx="24" cy="28" r="3" fill="#F8BBD0" />
        <rect x="23" y="28" width="2" height="4" fill="#F8BBD0" />
        <circle cx="24" cy="33" r="2" fill="#F8BBD0" />
        
        {/* Text with gradient */}
        <text 
          x="70" 
          y="36" 
          className="text-3xl font-bold"
          fill="url(#logoGradient)"
          fontFamily="'Comic Sans MS', 'Comic Sans', cursive"
          fontWeight="bold"
          fontSize="28"
        >
          NIBOG
        </text>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EC407A" />
            <stop offset="50%" stopColor="#7E57C2" />
            <stop offset="100%" stopColor="#42A5F5" />
          </linearGradient>
          
          {/* Sparkles */}
          <g id="sparkle">
            <path d="M4 0L5.5 3L8 4.5L5.5 6L4 9L2.5 6L0 4.5L2.5 3L4 0Z" fill="#FFD700" />
          </g>
        </defs>
        
        {/* Decorative elements */}
        <use href="#sparkle" x="30" y="5" transform="scale(0.7)" />
        <use href="#sparkle" x="90" y="5" transform="scale(0.5) rotate(15)" />
        <use href="#sparkle" x="110" y="15" transform="scale(0.6) rotate(-15)" />
        
        {/* Subtle motion lines */}
        <path d="M20 36C22 34 26 34 28 36" stroke="#42A5F5" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M15 40C18 38 22 38 25 40" stroke="#EC407A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>
      
      <Badge variant="outline" className="ml-3 hidden md:inline-flex border-primary text-xs">
        India's Biggest Baby Games
      </Badge>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

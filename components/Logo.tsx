import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo_grad_left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan-400 */}
        </linearGradient>
        <linearGradient id="logo_grad_right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" /> {/* Purple-500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
        </linearGradient>
        <filter id="logo_glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Abstract Lens/Code Brackets Shape */}
      {/* Left Bracket */}
      <path 
        d="M 42 20 L 22 50 L 42 80" 
        stroke="url(#logo_grad_left)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Right Bracket */}
      <path 
        d="M 58 20 L 78 50 L 58 80" 
        stroke="url(#logo_grad_right)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Central AI Spark/Iris */}
      <circle cx="50" cy="50" r="7" fill="white" filter="url(#logo_glow)" opacity="0.9" />
      <circle cx="50" cy="50" r="4" fill="#3b82f6" />
    </svg>
  );
};

export default Logo;
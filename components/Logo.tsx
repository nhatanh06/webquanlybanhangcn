import React from 'react';

const Logo: React.FC<{ className?: string; textClassName?: string }> = ({ 
  className = "h-10",
  textClassName = "text-white" 
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg
        className="h-full w-auto"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M22 2C33.0457 2 42 10.9543 42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22C2 10.9543 10.9543 2 22 2Z"
          fill="white"
        />
        <path
          d="M15.5 31L22 18L28.5 31"
          stroke="#2563EB" // Tailwind's blue-700
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 26H25"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-2xl font-bold tracking-tight ${textClassName}`}>
        AkStore
      </span>
    </div>
  );
};

export default Logo;

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "glass" | "gradient";
}

export default function Card({ 
  children, 
  className = "", 
  hover = false,
  variant = "default" 
}: CardProps) {
  const variants = {
    default: "bg-white border border-gray-border shadow-md",
    glass: "glass border border-white/20 backdrop-blur-lg",
    gradient: "bg-gradient-to-br from-white to-gray-light border-0 shadow-lg",
  };

  const hoverEffect = hover
    ? "hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-500 cursor-pointer"
    : "transition-shadow duration-300";

  return (
    <div
      className={`rounded-2xl p-6 ${variants[variant]} ${hoverEffect} ${className}`}
    >
      {children}
    </div>
  );
}


import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "gradient" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg hover:shadow-xl hover:scale-105 active:scale-100",
    secondary: "bg-dark text-white hover:bg-dark-light focus:ring-dark shadow-md hover:shadow-lg hover:scale-105 active:scale-100",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary backdrop-blur-sm",
    danger: "bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-lg hover:shadow-xl hover:scale-105 active:scale-100",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100",
    ghost: "text-gray hover:text-dark hover:bg-gray-light focus:ring-gray",
    gradient: "bg-gradient-to-r from-primary to-accent text-white hover:from-primary-dark hover:to-accent focus:ring-primary shadow-glow hover:shadow-xl hover:scale-105 active:scale-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer Effect */}
      {variant !== "ghost" && variant !== "outline" && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
      )}
      
      {loading && <Loader2 className="h-5 w-5 animate-spin relative z-10" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}


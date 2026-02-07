import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", containerClassName = "", icon, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 w-full ${containerClassName}`}>
        {label && (
          <label className="text-sm font-semibold text-dark">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              icon ? "pl-10" : ""
            } ${
              error 
                ? "border-danger bg-red-50" 
                : "border-gray-border focus:border-primary hover:border-gray-400"
            } ${className}`}
            {...props}
          />
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-danger" />
          )}
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
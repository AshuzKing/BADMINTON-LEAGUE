import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button = ({ className, variant = 'primary', fullWidth, children, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-3 font-bold uppercase tracking-wider transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed clip-path-polygon";
  
  const variants = {
    primary: "bg-electricBlue text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(0,116,255,0.5)] hover:shadow-[0_0_25px_rgba(0,116,255,0.7)]",
    success: "bg-neonGreen text-darkBlue hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,133,0.5)] hover:shadow-[0_0_25px_rgba(0,255,133,0.7)]",
    warning: "bg-championshipYellow text-darkBlue hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,221,0,0.5)] hover:shadow-[0_0_25px_rgba(255,221,0,0.7)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent border border-white/20 text-white hover:border-white/50"
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], fullWidth && "w-full", className))}
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
      {...props}
    >
      {children}
    </button>
  );
};

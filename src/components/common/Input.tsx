import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 mb-2">{label}</label>}
      <input
        ref={ref}
        className={twMerge(
          "w-full bg-darkBlue/80 border border-white/20 px-4 sm:px-4 py-3 sm:py-3 text-base sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all touch-target",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
        {...props}
      />
      {error && <span className="text-xs sm:text-sm text-red-400 mt-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';

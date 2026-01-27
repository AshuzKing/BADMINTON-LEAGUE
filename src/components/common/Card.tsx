import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={twMerge("bg-darkBlue/50 border border-white/10 p-4 sm:p-6 relative group overflow-hidden transition-all hover:border-electricBlue/50", onClick && "cursor-pointer hover:transform hover:-translate-y-1 touch-target", className)}
    >
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 group-hover:border-electricBlue transition-colors"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50 group-hover:border-electricBlue transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50 group-hover:border-electricBlue transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 group-hover:border-electricBlue transition-colors"></div>
      {children}
    </div>
  );
};

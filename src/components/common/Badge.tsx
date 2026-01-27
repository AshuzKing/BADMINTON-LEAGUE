import { twMerge } from 'tailwind-merge';

export const Badge = ({ status, className }: { status: 'pending' | 'live' | 'completed' | string; className?: string }) => {
  const styles = {
    pending: "bg-white/10 text-white/60 border-white/10",
    live: "bg-electricBlue text-white border-electricBlue animate-pulse",
    active: "bg-electricBlue text-white border-electricBlue",
    completed: "bg-neonGreen/20 text-neonGreen border-neonGreen",
    registration: "bg-championshipYellow/20 text-championshipYellow border-championshipYellow"
  };

  const key = status.toLowerCase() as keyof typeof styles;
  // @ts-ignore
  const style = styles[key] || styles.pending;

  return (
    <span className={twMerge("px-2 py-1 sm:py-0.5 text-xs sm:text-[10px] font-bold uppercase tracking-wider border rounded-sm touch-target", style, className)}>
      {status}
    </span>
  );
};

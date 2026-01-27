import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(admin);
  }, []);

  const toggleAdmin = () => {
    const newState = !isAdmin;
    setIsAdmin(newState);
    localStorage.setItem('isAdmin', String(newState));
    window.dispatchEvent(new Event('adminChange'));
    // Don't reload - it breaks Firebase listeners and loses data
  };

  return (
    <nav className="bg-darkBlue/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 safe-area-inset">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleAdmin}
            className={`text-lg sm:text-2xl font-black italic tracking-tighter flex items-center gap-2 group flex-shrink-0 rounded-lg p-2 sm:p-3 transition-all touch-target ${
              isAdmin
                ? 'bg-neonGreen/20 ring-2 ring-neonGreen shadow-[0_0_15px_rgba(0,255,133,0.3)]'
                : 'hover:bg-white/5'
            }`}
            title={isAdmin ? 'Click to disable admin mode' : 'Click to enable admin mode'}
            aria-label="Toggle admin mode"
          >
            <span className={`${isAdmin ? 'animate-pulse' : 'group-hover:animate-pulse'}`}>⚡</span>
          </button>
          <Link to="/" className="text-sm sm:text-lg md:text-2xl font-black italic tracking-tight text-white group truncate">
            <span className="group-hover:text-electricBlue transition-colors">Badminton League</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neonGreen/20 border border-neonGreen/50">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-neonGreen">🔐 ADMIN</span>
              <button
                onClick={toggleAdmin}
                className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-all touch-target"
              >
                OFF
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

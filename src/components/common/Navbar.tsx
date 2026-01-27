import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(admin);
  }, []);

  const toggleAdmin = () => {
    const newState = !isAdmin;
    setIsAdmin(newState);
    localStorage.setItem('isAdmin', String(newState));
    window.dispatchEvent(new Event('adminChange'));
    window.location.reload();
  };

  return (
    <nav className="bg-darkBlue/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 safe-area-inset">
      <div className="flex justify-between items-center gap-4">
        <Link to="/" className="text-lg sm:text-2xl font-black italic tracking-tighter text-white flex items-center gap-2 group flex-shrink-0">
          <span className="text-neonGreen group-hover:animate-pulse px-2">⚡</span>
          <span className="hidden sm:inline group-hover:text-electricBlue transition-colors">Badminton League</span>
          <span className="sm:hidden group-hover:text-electricBlue transition-colors">League</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="px-3 py-2 sm:px-3 sm:py-2 rounded text-[10px] sm:text-xs font-bold tracking-widest uppercase border bg-neonGreen text-darkBlue border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.5)] hover:bg-white hover:text-darkBlue transition-all touch-target"
                aria-label="Admin menu"
              >
                ADMIN
              </button>
              {showAdminMenu && (
                <button
                  onClick={toggleAdmin}
                  className="absolute top-full right-0 mt-2 px-3 py-2 rounded text-xs font-bold tracking-widest uppercase border bg-red-600 text-white border-red-600 hover:bg-red-700 transition-all touch-target whitespace-nowrap"
                >
                  LOGOUT
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

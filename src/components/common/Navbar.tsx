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
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('adminChange'));
    window.location.reload(); 
  };

  return (
    <nav className="bg-darkBlue/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2 group">
        <span className="text-neonGreen group-hover:animate-pulse">⚡</span> 
        <span className="group-hover:text-electricBlue transition-colors">SMASH</span>
        <span className="text-white/80">arena</span>
      </Link>

      <div className="flex items-center gap-6">
        {isAdmin && (
          <button 
            onClick={() => window.location.href = '/logout'}
            className="px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase border bg-neonGreen text-darkBlue border-neonGreen shadow-[0_0_10px_rgba(0,255,133,0.5)] hover:bg-white hover:text-darkBlue transition-all"
          >
            ADMIN ACTIVE (CLICK TO LOGOUT)
          </button>
        )}
      </div>
    </nav>
  );
};

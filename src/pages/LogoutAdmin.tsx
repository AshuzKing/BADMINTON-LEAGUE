import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogoutAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Disable admin mode
    localStorage.setItem('isAdmin', 'false');
    // Notify other components
    window.dispatchEvent(new Event('adminChange'));
    
    // Slight delay for effect, then redirect home
    const timer = setTimeout(() => {
      navigate('/');
      window.location.reload(); 
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-6xl mb-4 animate-bounce">👋</div>
      <h1 className="text-3xl font-black italic uppercase text-white mb-2">Logging Out</h1>
      <p className="text-white/50 font-mono animate-pulse">Deactivating Admin Privileges...</p>
    </div>
  );
};

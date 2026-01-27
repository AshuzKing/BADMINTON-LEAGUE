import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Enable admin mode
    localStorage.setItem('isAdmin', 'true');
    // Notify other components
    window.dispatchEvent(new Event('adminChange'));
    
    // Slight delay for effect, then redirect home
    const timer = setTimeout(() => {
      navigate('/');
      window.location.reload(); // Ensure global state refresh
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-6xl mb-4 animate-bounce">🔐</div>
      <h1 className="text-3xl font-black italic uppercase text-white mb-2">Authenticating</h1>
      <p className="text-neonGreen font-mono animate-pulse">Initializing Admin Protocols...</p>
    </div>
  );
};
